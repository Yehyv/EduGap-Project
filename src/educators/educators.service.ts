import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, In } from 'typeorm';
import { Educator } from './entities/educator.entity';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Injectable()
export class EducatorsService {
  constructor(
    @InjectRepository(Educator)
    private readonly educatorRepo: Repository<Educator>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  /** Create */
  async create(dto: CreateEducatorDto, image?: Express.Multer.File) {
    // 1) هات اليوزر
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

    // 2) تأكد ماعندوش educator قبل كده
    const existing = await this.educatorRepo.findOne({
      where: { user: { id: dto.userId } },
      relations: ['user'],
    });
    if (existing)
      throw new ConflictException('This user already has an educator profile');
    const baseUrl = process.env.APP_URL || '';
    const imageUrl = image
      ? `${baseUrl}/uploads/educator-images/${image.filename}`
      : '';
    // 3) أنشئ ال educator واربطه باليوزر
    const educator = this.educatorRepo.create({
      title: dto.title,
      bio: dto.bio,
      image: imageUrl,
      video_intro: dto.video_intro ?? undefined,
      user, // الربط هنا
    });

    const saved = await this.educatorRepo.save(educator);

    // 4) رجّع مع full_name
    return this.findOne(saved.id);
  }

  /**
   * Find all (search + pagination + include user full_name)
   */
  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 20,
    onlyActive?: number,
  ) {
    const base: FindOptionsWhere<Educator> = {};
    if (onlyActive === 1) base.is_active = 1;

    const where: FindOptionsWhere<Educator>[] =
      search && search.trim()
        ? [
            { ...base, title: ILike(`%${search}%`) },
            { ...base, bio: ILike(`%${search}%`) },
          ]
        : [base];

    const [items, total] = await this.educatorRepo.findAndCount({
      where,
      relations: ['user'], // 👈 مهم: عشان نطلع full_name
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // ماب للـ DTO الناتج
    const mapped = items.map((e) => ({
      id: e.id,
      title: e.title,
      bio: e.bio,
      image: e.image,
      video_intro: e.video_intro,
      is_active: e.is_active,
      created_at: e.created_at,
      updated_at: e.updated_at,
      deleted_at: e.deleted_at,
      user: {
        id: e.user?.id ?? null,
        full_name: e.user?.full_name ?? '', // 👈 الاسم
        email: e.user?.email ?? '',
      },
    }));

    return {
      items: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async educatorsNav(onlyActive?: number) {
    const base: FindOptionsWhere<Educator> = {};
    if (onlyActive === 1) base.is_active = 1;

    const items = await this.educatorRepo.find({
      where: base,
      relations: ['user'],
      order: { title: 'ASC' },
    });
    const mapped = items.map((e) => ({
      id: e.id,
      title: e.title,
      bio: e.bio,
      image: e.image,
      user: {
        full_name: e.user?.full_name ?? '',
      },
    }));
    return mapped;
  }

  /** Find one (with user full_name) */
  async findOne(id: number) {
    const educator = await this.educatorRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!educator) throw new NotFoundException(`Educator ${id} not found`);

    return {
      id: educator.id,
      title: educator.title,
      bio: educator.bio,
      image: educator.image,
      video_intro: educator.video_intro,
      is_active: educator.is_active,
      created_at: educator.created_at,
      updated_at: educator.updated_at,
      deleted_at: educator.deleted_at,
      user: {
        id: educator.user?.id ?? null,
        full_name: educator.user?.full_name ?? '',
        email: educator.user?.email ?? '',
      },
    };
  }

  /** Update (يدعم تبديل اليوزر مع ضمان 1:1) */
  async update(
    id: number,
    dto: UpdateEducatorDto,
    image?: Express.Multer.File,
  ) {
    const educator = await this.educatorRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!educator) throw new NotFoundException(`Educator ${id} not found`);

    // لو فيه userId جديد
    if (dto.userId !== undefined && dto.userId !== educator.user?.id) {
      const newUser = await this.userRepo.findOne({
        where: { id: dto.userId },
      });
      if (!newUser) throw new NotFoundException(`User ${dto.userId} not found`);

      // تأكد إن مفيش Educator تاني ماسك نفس اليوزر
      const exists = await this.educatorRepo.findOne({
        where: { user: { id: dto.userId } },
      });
      if (exists)
        throw new ConflictException(
          'Target user already has an educator profile',
        );

      educator.user = newUser;
    }

    if (dto.is_active !== undefined && ![0, 1].includes(dto.is_active)) {
      throw new BadRequestException('is_active must be 0 or 1');
    }
    if (image) {
      const baseUrl = process.env.APP_URL || '';
      const imageUrl = image
        ? `${baseUrl}/uploads/educator-images/${image.filename}`
        : '';
      educator.image = imageUrl;
    }

    Object.assign(educator, {
      title: dto.title ?? educator.title,
      bio: dto.bio ?? educator.bio,
      video_intro: dto.video_intro ?? educator.video_intro,
      is_active: dto.is_active ?? educator.is_active,
    });

    await this.educatorRepo.save(educator);
    return this.findOne(id);
  }

  /** Soft delete */
  async remove(id: number) {
    const educator = await this.educatorRepo.findOne({ where: { id } });
    if (!educator) throw new NotFoundException(`Educator ${id} not found`);
    await this.educatorRepo.softDelete(id);
    return { message: `Educator ${id} deleted successfully` };
  }

  /** Restore (اختياري) */
  async restore(id: number) {
    await this.educatorRepo.restore(id);
    return { message: `Educator ${id} restored successfully` };
  }

  /** Toggle Active (اختياري) */
  async toggleActive(id: number) {
    const educator = await this.educatorRepo.findOne({ where: { id } });
    if (!educator) throw new NotFoundException(`Educator ${id} not found`);
    educator.is_active = educator.is_active === 1 ? 0 : 1;
    await this.educatorRepo.save(educator);
    return { id, is_active: educator.is_active };
  }

  async findFirstEight(onlyActive: number = 1) {
    const where: FindOptionsWhere<Educator> = {};
    if (onlyActive === 1) where.is_active = 1;

    const list = await this.educatorRepo.find({
      where,
      relations: ['user'], // 👈 رجّع اليوزر
      order: { id: 'DESC' },
      take: 8,
    });

    // ماب علشان نضيف full_name
    return list.map((e) => ({
      id: e.id,
      title: e.title,
      bio: e.bio,
      image: e.image,
      video_intro: e.video_intro,
      is_active: e.is_active,
      user: {
        id: e.user?.id ?? null,
        full_name: e.user?.full_name ?? '',
        email: e.user?.email ?? '',
      },
    }));
  }
  async findContentsByEducator(
    educatorId: number,
    {
      page = 1,
      limit = 8,
      languageId,
      instituteId,
      programId,
      userId, // اختياري لإرجاع isEnrolled
    }: {
      page?: number;
      limit?: number;
      languageId?: number;
      instituteId?: number;
      programId?: number;
      userId?: number;
    },
  ) {
    const skip = (page - 1) * limit;

    // نتأكد الخبير موجود (اختياري بس أفضل)
    const exists = await this.educatorRepo.findOne({
      where: { id: educatorId },
    });
    if (!exists)
      throw new NotFoundException(`Educator ${educatorId} not found`);

    // 1) نجيب صفحة المحتويات لهذا الخبير + ترجمات وكاتيجوري
    const qb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .leftJoinAndSelect(
        'c.translations',
        'tr',
        languageId ? 'tr.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('c.contentCategory', 'cat')
      .leftJoinAndSelect(
        'cat.translations',
        'catTr',
        languageId ? 'catTr.languageId = :languageId' : undefined,
        { languageId },
      )
      .where('c.deleted_at IS NULL')
      .andWhere('c.educatorId = :eid', { eid: educatorId })
      .orderBy('c.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (instituteId)
      qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    if (programId) qb.andWhere('ipc.programId = :programId', { programId });

    const [rows, total] = await qb.getManyAndCount();

    if (!rows.length) {
      const totalPages = Math.ceil(total / limit);
      return {
        items: [],
        contentsCount: total,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    }

    const ids = rows.map((c) => c.id);

    // 2) totalDuration + ratersCount (مجمّعة)
    const statsRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .addSelect('SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END)', 'ratersCount')
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: number; totalDuration: string; ratersCount: string }>();

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // 3) isEnrolled (لو في userId)
    let enrolledMap = new Map<number, boolean>();
    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select(['en.contentId AS cid'])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number }>();
      enrolledMap = new Map(enrRows.map((r) => [Number(r.cid), true]));
    }

    // 4) بناء العناصر بنفس شكل الكارد تقريبًا
    const items = rows.map((c) => {
      const tr =
        c.translations?.find((t) => t.language?.id === languageId) ||
        c.translations?.[0];
      const catTr =
        c.contentCategory?.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.contentCategory?.translations?.[0];

      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,

        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        isEnrolled: enrolledMap.get(c.id) ?? false,
        // isSaved: false, // لو عايزها نقفّلها لاحقًا بسبكويري بسيط

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        created_at: c.created_at,
      };
    });

    const totalPages = Math.ceil(total / limit);
    return {
      items,
      contentsCount: total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
