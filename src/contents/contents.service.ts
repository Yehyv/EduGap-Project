import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { ContentTranslation } from './entities/content-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Course } from 'src/courses/entities/course.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { ContentCategory } from 'src/course-categories/entities/content-category.entity';
import { CreateContentDto, UpdateContentDto } from './dto/create-content.dto';
import { Package } from 'src/packages/entities/package.entity';
import { PackageContent } from 'src/packages/entities/package-content.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(ContentTranslation)
    private readonly translationRepo: Repository<ContentTranslation>,
    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(CourseContent)
    private readonly courseContentRepo: Repository<CourseContent>,
    @InjectRepository(ContentCategory)
    private readonly categoryRepo: Repository<ContentCategory>,
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    @InjectRepository(PackageContent)
    private readonly packageContentRepo: Repository<PackageContent>,
    @InjectRepository(Educator)
    private readonly educatorRepo: Repository<Educator>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  /** ----------------------------------------------------------------
   * ✅ إنشاء محتوى جديد فقط (بدون أي ربط بالكورسات)
   * ---------------------------------------------------------------- */
  async create(dto: CreateContentDto) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const content = this.contentRepo.create({
      image: dto.image ?? '',
      rate: dto.rate ?? 0,
      level: dto.level ?? 'Beginner',
      adVideo: dto.adVideo ?? '',
      contentCategory: category,
    });

    const savedContent = await this.contentRepo.save(content);

    // 🟩 إنشاء الترجمات الخاصة بالمحتوى
    for (const t of dto.translations) {
      const lang = await this.languageRepo.findOne({
        where: { id: t.languageId },
      });
      if (!lang)
        throw new NotFoundException(`Language ${t.languageId} not found`);

      const translation = this.translationRepo.create({
        name: t.name,
        description: t.description,
        level_name: t.levelName,
        what_to_learn: t.whatToLearn?.join(', ') || undefined,
        previous_background: t.previousBackground ?? undefined,
        language_type: t.languageType ?? 'Arabic',
        language: lang,
        content: savedContent,
      });

      await this.translationRepo.save(translation);
    }

    return this.findOne(savedContent.id);
  }

  /** ----------------------------------------------------------------
   * ✅ عرض كل المحتويات
   * ---------------------------------------------------------------- */
  async findAll(languageId?: number) {
    const contents = await this.contentRepo.find({
      relations: ['translations', 'contentCategory'],
      order: { id: 'DESC' },
    });

    return contents.map((c) => {
      const tr =
        c.translations.find((t) => t.language?.id === languageId) ||
        c.translations[0];

      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,
        rate: c.rate,
        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
        },
      };
    });
  }

  /** ----------------------------------------------------------------
   * ✅ عرض محتوى واحد بالتفصيل
   * ---------------------------------------------------------------- */
  async findOne(id: number, languageId?: number) {
    const content = await this.contentRepo.findOne({
      where: { id },
      relations: [
        'translations',
        'translations.language',
        'contentCategory',
        'courseContents.course',
      ],
    });

    if (!content) throw new NotFoundException('Content not found');

    const tr =
      content.translations.find((t) => t.language?.id === languageId) ||
      content.translations[0];

    return {
      id: content.id,
      name: tr?.name ?? '',
      description: tr?.description ?? '',
      level: content.level,
      rate: content.rate,
      adVideo: content.adVideo,
      image: content.image,
      categoryId: content.contentCategory?.id ?? null,
      whatToLearn: tr?.what_to_learn?.split(',') ?? [],
      previousBackground: tr?.previous_background ?? '',
    };
  }

  /** ----------------------------------------------------------------
   * ✅ تحديث المحتوى (مع الترجمات فقط)
   * ---------------------------------------------------------------- */
  async update(id: number, dto: UpdateContentDto) {
    const content = await this.contentRepo.findOne({
      where: { id },
      relations: ['translations'],
    });
    if (!content) throw new NotFoundException('Content not found');

    Object.assign(content, {
      image: dto.image ?? content.image,
      rate: dto.rate ?? content.rate,
      level: dto.level ?? content.level,
    });

    await this.contentRepo.save(content);

    // تحديث الترجمات
    if (dto.translations?.length) {
      for (const t of dto.translations) {
        const lang = await this.languageRepo.findOne({
          where: { id: t.languageId },
        });
        if (!lang)
          throw new NotFoundException(`Language ${t.languageId} not found`);

        const existing = await this.translationRepo.findOne({
          where: { content: { id }, language: { id: t.languageId } },
        });

        if (existing) {
          existing.name = t.name ?? existing.name;
          existing.description = t.description ?? existing.description;
          existing.level_name = t.levelName ?? existing.level_name;
          existing.what_to_learn =
            t.whatToLearn?.join(', ') ?? existing.what_to_learn;
          existing.previous_background =
            t.previousBackground ?? existing.previous_background;
          await this.translationRepo.save(existing);
        } else {
          const newTr = this.translationRepo.create({
            name: t.name,
            description: t.description,
            level_name: t.levelName,
            what_to_learn: t.whatToLearn?.join(', ') || undefined,
            previous_background: t.previousBackground ?? undefined,
            language: lang,
            content,
          });
          await this.translationRepo.save(newTr);
        }
      }
    }

    return this.findOne(id);
  }

  /** ----------------------------------------------------------------
   * ✅ ربط محتوى بكورسات (assign)
   * ---------------------------------------------------------------- */
  async assignToCourses(contentId: number, courseIds: number[]) {
    if (!courseIds?.length)
      throw new BadRequestException('courseIds must be provided');

    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content) throw new NotFoundException('Content not found');

    const courses = await this.courseRepo.findBy({ id: In(courseIds) });
    if (courses.length !== courseIds.length)
      throw new NotFoundException('Some courses not found');

    const links = courses.map((course) =>
      this.courseContentRepo.create({ course, content, is_active: 1 }),
    );
    await this.courseContentRepo.save(links);

    return { message: 'Content assigned to courses successfully' };
  }

  /** ----------------------------------------------------------------
   * ✅ إزالة الربط بين محتوى وكورسات (unassign)
   * ---------------------------------------------------------------- */
  async removeFromCourses(contentId: number, courseIds: number[]) {
    if (!courseIds?.length)
      throw new BadRequestException('courseIds must be provided');

    const links = await this.courseContentRepo.find({
      where: {
        content: { id: contentId },
        course: In(courseIds.map((id) => ({ id }))),
      },
    });

    if (!links.length)
      throw new NotFoundException('No related course-content found');

    await this.courseContentRepo.remove(links);
    return { message: 'Content unassigned successfully' };
  }

  /** ----------------------------------------------------------------
   * ✅ حذف المحتوى (Soft delete)
   * ---------------------------------------------------------------- */
  async softDelete(id: number) {
    const content = await this.contentRepo.findOne({ where: { id } });
    if (!content) throw new NotFoundException('Content not found');
    await this.contentRepo.softRemove(content);
    return { message: 'Content deleted successfully' };
  }

  /** ----------------------------------------------------------------
   * ✅ استرجاع محتوى محذوف
   * ---------------------------------------------------------------- */
  async restore(id: number) {
    await this.contentRepo.restore(id);
    return { message: 'Content restored successfully' };
  }

  // 🔹 تريندينج بباجينيشن (8 في الصفحة)
  async findTrendingPaginated(
    page = 1,
    limit = 8,
    languageId?: number,
    instituteId?: number,
    programId?: number,
    userId?: number, // 👈 اختياري
  ) {
    const offset = (page - 1) * limit;

    const baseQb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .select('c.id', 'id')
      .addSelect('COUNT(e.id)', 'cnt')
      .groupBy('c.id')
      .orderBy('cnt', 'DESC');

    if (instituteId)
      baseQb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    if (programId) baseQb.andWhere('ipc.programId = :programId', { programId });

    const allRows = await baseQb.getRawMany<{ id: number; cnt: string }>();
    const total = allRows.length;

    const pageRows = await baseQb
      .limit(limit)
      .offset(offset)
      .getRawMany<{ id: number; cnt: string }>();
    if (!pageRows.length) {
      return {
        items: [],
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

    const ids = pageRows.map((r) => Number(r.id));
    const countMap = new Map(ids.map((id, i) => [id, Number(pageRows[i].cnt)]));
    const orderIndex = new Map(ids.map((id, i) => [id, i]));

    // متوسط التقييم → تخزينه في content.rate
    const avgRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e2')
      .select('c.id', 'id')
      .addSelect(
        `
      CASE
        WHEN SUM(CASE WHEN e2.rating > 0 THEN 1 ELSE 0 END) = 0
        THEN 0
        ELSE ROUND(
          SUM(CASE WHEN e2.rating > 0 THEN e2.rating ELSE 0 END)
          / SUM(CASE WHEN e2.rating > 0 THEN 1 ELSE 0 END), 2
        )
      END
      `,
        'avg',
      )
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: number; avg: string }>();

    for (const r of avgRows) {
      await this.contentRepo.update(
        { id: Number(r.id) },
        { rate: Number(r.avg) },
      );
    }

    // إجمالي المدة + عدد المقيمين
    const statsRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .leftJoin('c.enrollments', 'e3')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .addSelect(
        'SUM(CASE WHEN e3.rating > 0 THEN 1 ELSE 0 END)',
        'ratersCount',
      )
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: number; totalDuration: string; ratersCount: string }>();

    const durationMap = new Map(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // ✅ فلاج الالتحاق لو فيه userId
    let enrolledMap = new Map<number, boolean>();
    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select(['en.contentId AS cid', 'en.status AS status'])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number; status: number }>();

      enrolledMap = new Map(
        enrRows.map((r) => [Number(r.cid), Number(r.status) === 0]),
      );
    }

    const contents = await this.contentRepo.find({
      where: { id: In(ids) },
      relations: [
        'translations',
        'translations.language',
        'contentCategory',
        'educator',
        'educator.user',
      ],
    });

    contents.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const items = contents.map((c) => {
      const tr =
        c.translations.find((t) => t.language?.id === languageId) ||
        c.translations[0];

      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,

        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,

        // 👇 الفلاج الجديد
        isEnrolled: enrolledMap.get(c.id) ?? false,
        isSaved: false,

        educator: c.educator
          ? {
              id: c.educator.id,
              title: c.educator.title,
              name: c.educator.user?.full_name ?? '',
            }
          : null,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: { id: c.contentCategory?.id ?? null },
        enrollmentsCount: countMap.get(c.id) ?? 0,
      };
    });

    return {
      items,
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

  async findTrendingFirstEight(
    languageId?: number,
    instituteId?: number,
    programId?: number,
    userId?: number, // 👈 اختياري
  ) {
    const qb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .select('c.id', 'id')
      .addSelect('COUNT(e.id)', 'cnt')
      .groupBy('c.id')
      .orderBy('cnt', 'DESC')
      .limit(8);

    if (instituteId)
      qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    if (programId) qb.andWhere('ipc.programId = :programId', { programId });

    const rows = await qb.getRawMany<{ id: number; cnt: string }>();
    if (!rows.length) return [];

    const ids = rows.map((r) => Number(r.id));
    const countMap = new Map(rows.map((r) => [Number(r.id), Number(r.cnt)]));
    const orderIndex = new Map(ids.map((id, i) => [id, i]));

    // متوسطات → تخزين في content.rate
    const avgRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e2')
      .select('c.id', 'id')
      .addSelect(
        `
      CASE
        WHEN SUM(CASE WHEN e2.rating > 0 THEN 1 ELSE 0 END) = 0
        THEN 0
        ELSE ROUND(
          SUM(CASE WHEN e2.rating > 0 THEN e2.rating ELSE 0 END)
          / SUM(CASE WHEN e2.rating > 0 THEN 1 ELSE 0 END), 2
        )
      END
      `,
        'avg',
      )
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: number; avg: string }>();

    for (const r of avgRows) {
      await this.contentRepo.update(
        { id: Number(r.id) },
        { rate: Number(r.avg) },
      );
    }

    // مدة + عدّاد مقيمين
    const statsRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .leftJoin('c.enrollments', 'e3')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .addSelect(
        'SUM(CASE WHEN e3.rating > 0 THEN 1 ELSE 0 END)',
        'ratersCount',
      )
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: number; totalDuration: string; ratersCount: string }>();

    const durationMap = new Map(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // ✅ فلاج الالتحاق
    let enrolledMap = new Map<number, boolean>();
    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select(['en.contentId AS cid', 'en.status AS status'])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number; status: number }>();

      enrolledMap = new Map(
        enrRows.map((r) => [Number(r.cid), Number(r.status) === 0]),
      );
    }

    const contents = await this.contentRepo.find({
      where: { id: In(ids) },
      relations: [
        'translations',
        'translations.language',
        'contentCategory',
        'educator',
        'educator.user',
      ],
    });

    contents.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    return contents.map((c) => {
      const tr =
        c.translations.find((t) => t.language?.id === languageId) ||
        c.translations[0];

      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,

        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,

        // 👇 الفلاج
        isEnrolled: enrolledMap.get(c.id) ?? false,
        isSaved: false,

        educator: c.educator
          ? {
              id: c.educator.id,
              title: c.educator.title,
              name: c.educator.user?.full_name ?? '',
            }
          : null,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: { id: c.contentCategory?.id ?? null },
        enrollmentsCount: countMap.get(c.id) ?? 0,
      };
    });
  }

  // داخل ContentsService

  async assignContentToPackage(packageId: number, contentIds: number[]) {
    if (!contentIds?.length) {
      throw new BadRequestException('contentIds must be provided');
    }

    const pkg = await this.packageRepo.findOne({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    // تأكد إن كل الـ contents موجودة
    const contents = await this.contentRepo.findBy({ id: In(contentIds) });
    if (contents.length !== contentIds.length) {
      throw new NotFoundException('Some contents not found');
    }

    // هات الموجود (بما فيها المتشالة Soft) في Query واحدة
    const existingLinks = await this.packageContentRepo.find({
      where: {
        package: { id: packageId },
        content: In(contentIds.map((id) => ({ id }))),
      },
      withDeleted: true,
    });

    const existingMap = new Map<number, (typeof existingLinks)[number]>();
    for (const link of existingLinks) {
      // link.content.id موجود لأننا عملنا relations ضمنيًا في الشرط
      existingMap.set(link.content?.id ?? link['contentId'], link);
    }

    const created: number[] = [];
    const restored: number[] = [];
    const skipped: number[] = [];

    for (const cid of contentIds) {
      const found = existingMap.get(cid);
      if (found) {
        // لو link موجود
        if ((found as any).deleted_at) {
          // كان متشال Soft → رجّعه وفعلّه
          await this.packageContentRepo.recover(found as any);
          found.is_active = 1;
          await this.packageContentRepo.save(found);
          restored.push(cid);
        } else {
          // موجود بالفعل وActive
          skipped.push(cid);
        }
      } else {
        // اعمل create جديد
        const link = this.packageContentRepo.create({
          package: { id: packageId },
          content: { id: cid },
          is_active: 1,
        });
        await this.packageContentRepo.save(link);
        created.push(cid);
      }
    }

    return {
      message: 'Assign completed',
      created,
      restored,
      skipped,
    };
  }

  async unAssignContentFromPackage(packageId: number, contentIds: number[]) {
    if (!contentIds?.length) {
      throw new BadRequestException('contentIds must be provided');
    }

    // هات الروابط الموجودة (لو مش موجودة هنعدّيها بلطف)
    const links = await this.packageContentRepo.find({
      where: {
        package: { id: packageId },
        content: In(contentIds.map((id) => ({ id }))),
      },
      withDeleted: true,
    });

    if (!links.length) {
      throw new NotFoundException('No package-content links found');
    }

    // فلتر الروابط اللي لسه مش متشالة Soft
    const activeLinks = links.filter((l: any) => !l.deleted_at);
    if (!activeLinks.length) {
      return { message: 'Already unassigned for all provided contents' };
    }

    await this.packageContentRepo.softDelete(activeLinks.map((l) => l.id));

    return {
      message: 'Unassign completed',
      softDeletedIds: activeLinks.map((l) => l.id),
    };
  }

  // أحدث الدورات – Paginated (8/صفحة) + فلترة بالمعهد/البرنامج
  async findLatestPaginated(
    page = 1,
    limit = 8,
    languageId?: number,
    instituteId?: number, // اختياري
    programId?: number, // اختياري
  ) {
    const skip = (page - 1) * limit;

    const qb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .leftJoinAndSelect('c.translations', 'tr')
      .leftJoinAndSelect('tr.language', 'lang')
      .leftJoinAndSelect('c.contentCategory', 'cat')
      .where('c.deleted_at IS NULL')
      .orderBy('c.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (instituteId) {
      qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }
    if (programId) {
      qb.andWhere('ipc.programId = :programId', { programId });
    }

    const [rows, total] = await qb.getManyAndCount();

    const items = rows.map((c) => {
      const tr =
        c.translations?.find((t) => t.language?.id === languageId) ||
        c.translations?.[0];

      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,
        rate: c.rate,
        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: { id: c.contentCategory?.id ?? null },
        created_at: c.created_at,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
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

  // أحدث الدورات – أول 8 (للسلايدر)
  // أحدث الدورات – أول 8 (سلايدر) + فلترة بالمعهد/البرنامج
  async findLatestFirstEight(
    languageId?: number,
    instituteId?: number, // اختياري
    programId?: number, // اختياري
  ) {
    const qb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .leftJoinAndSelect('c.translations', 'tr')
      .leftJoinAndSelect('tr.language', 'lang')
      .leftJoinAndSelect('c.contentCategory', 'cat')
      .where('c.deleted_at IS NULL')
      .orderBy('c.created_at', 'DESC')
      .take(8);

    if (instituteId) {
      qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }
    if (programId) {
      qb.andWhere('ipc.programId = :programId', { programId });
    }

    const rows = await qb.getMany();

    return rows.map((c) => {
      const tr =
        c.translations?.find((t) => t.language?.id === languageId) ||
        c.translations?.[0];

      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,
        rate: c.rate,
        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: { id: c.contentCategory?.id ?? null },
        created_at: c.created_at,
      };
    });
  }

  // أحدث دورة واحدة (للمعهد/البرنامج بتوع المستخدم)
  async findLatestOneForUser(
    instituteId: number,
    programId?: number,
    languageId?: number,
  ) {
    const qb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .leftJoinAndSelect('c.translations', 'tr')
      .leftJoinAndSelect('tr.language', 'lang')
      .leftJoinAndSelect('c.contentCategory', 'cat')
      .leftJoinAndSelect('c.educator', 'educator')
      .leftJoinAndSelect('educator.user', 'eduUser')
      .where('c.deleted_at IS NULL')
      .orderBy('c.created_at', 'DESC')
      .limit(1);

    if (instituteId) {
      qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }
    if (programId) {
      qb.andWhere('ipc.programId = :programId', { programId });
    }

    const row = await qb.getOne();
    if (!row) {
      throw new NotFoundException(
        'No latest content found for this institute/program',
      );
    }
    const e = row.educator;

    const tr =
      row.translations?.find((t) => t.language?.id === languageId) ||
      row.translations?.[0];

    return {
      id: row.id,
      ad_video: row.adVideo,
      name: tr?.name ?? '',
      description: tr?.description ?? '',
      image: row.image,
      level: row.level,
      rate: row.rate,
      whatToLearn: tr?.what_to_learn?.split(',') ?? [],
      category: { id: row.contentCategory?.id ?? null },
      created_at: row.created_at,
      educator: e
        ? {
            id: e.id,
            title: e.title,
            bio: e.bio,
            image: e.image,
            name: e.user?.full_name ?? '',
            userId: e.user?.id ?? null,
            rate: 5, // ثابت مؤقتًا
          }
        : null,
    };
  }
  async assignEducator(contentId: number, educatorId: number) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
      relations: ['educator'],
    });
    if (!content) throw new NotFoundException(`Content ${contentId} not found`);

    const educator = await this.educatorRepo.findOne({
      where: { id: educatorId },
      relations: ['user'],
    });
    if (!educator)
      throw new NotFoundException(`Educator ${educatorId} not found`);

    content.educator = educator;
    await this.contentRepo.save(content);

    return {
      message: 'Educator assigned to content',
      contentId: content.id,
      educator: {
        id: educator.id,
        title: educator.title,
        name: educator.user?.full_name ?? '',
      },
    };
  }

  /** Unassign educator from content (set null) */
  async unassignEducator(contentId: number) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
      relations: ['educator'],
    });
    if (!content) throw new NotFoundException(`Content ${contentId} not found`);
    if (!content.educator) return { message: 'Already unassigned', contentId };

    content.educator = null;
    await this.contentRepo.save(content);

    return { message: 'Educator unassigned from content', contentId };
  }

  /** “Restore” = re-assign to a given educator (alias of assign) */
  async restoreEducator(contentId: number, educatorId: number) {
    // لو عايز ترجع “آخر واحد” لازم تحتفظ بتاريخ — لكن هنا هنرجّع للي تبعثه
    return this.assignEducator(contentId, educatorId);
  }

  async getContentEducator(contentId: number) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
      relations: ['educator', 'educator.user'],
    });

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    const e = content.educator;
    return {
      contentId: content.id,
      educator: e
        ? {
            id: e.id,
            title: e.title,
            bio: e.bio,
            image: e.image,
            // اسم المدرس من جدول الـuser
            name: e.user?.full_name ?? '',
            userId: e.user?.id ?? null,
            rate: 5,
          }
        : null, // لو لسه ما اتعيَّن مدرّس
    };
  }
}
