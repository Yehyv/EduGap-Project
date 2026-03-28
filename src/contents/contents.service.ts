import {
  BadRequestException,
  ConflictException,
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
import { ContentCategory } from 'src/content-categories/entities/content-category.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { Package } from 'src/packages/entities/package.entity';
import { PackageContent } from 'src/packages/entities/package-content.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { SavedContent } from 'src/saved-contents/entities/saved-content.entity'; // عدّل المسار حسب مشروعك
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { UpdateContentDto } from './dto/update-content.dto';
interface contentRow {
  content_id: number;
  content_image: string;
  content_level: string;
  content_rate: number;
  content_isActive: number;
  content_createdAt: Date;
  translation_name: string;
  translation_description: string;
  translation_what_to_learn: string[];
  category_id: number;
  categoryTranslation_name: string;
  created_by_id: number;
  created_by_full_name: string;
}
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
    @InjectRepository(SavedContent)
    private readonly savedContentRepo: Repository<SavedContent>,
    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}
  private pickTr<T extends { language?: { id?: number } }>(
    list: T[] | undefined,
    languageId?: number,
  ): T | undefined {
    if (!list || !list.length) return undefined;
    if (languageId == null) return list[0];
    return (
      list.find(
        (t: any) =>
          t?.language?.id === languageId || t?.languageId === languageId,
      ) ?? list[0]
    );
  }
  private async buildSavedMap(userId: number | undefined, ids: number[]) {
    if (!userId || ids.length === 0) return new Map<number, boolean>();

    const rows = await this.savedContentRepo
      .createQueryBuilder('s')
      .leftJoin('s.user', 'u')
      .leftJoin('s.content', 'c')
      .select(['c.id AS cid'])
      .where('u.id = :uid', { uid: userId })
      .andWhere('c.id IN (:...ids)', { ids })
      // بدون withDeleted => يعني بس النشطة (مش متشالة سوفت)
      .getRawMany<{ cid: number }>();

    return new Map(rows.map((r) => [Number(r.cid), true]));
  }

  /** ----------------------------------------------------------------
   * ✅ إنشاء محتوى جديد فقط (بدون أي ربط بالكورسات)
   * ---------------------------------------------------------------- */
  async create(
    dto: CreateContentDto,
    userId: number,
    image?: Express.Multer.File,
  ) {
    const user = await this.educatorRepo.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');
    const baseUrl = process.env.BASE_URL || '';
    const imageUrl = image
      ? `${baseUrl}/uploads/content-images/${image.filename}`
      : '';
    const content = this.contentRepo.create({
      image: imageUrl,
      rate: dto.rate ?? 0,
      level: dto.level ?? 'Beginner',
      adVideo: dto.adVideo ?? '',
      contentCategory: category,
      hasPrerequiest: dto.hasPrerequiest ?? 0,
      createdBy: user,
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
  async findAll(languageId?: number, instituteId?: number, role?: string) {
    const query = this.contentRepo
      .createQueryBuilder('content')
      .leftJoin('content.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .where('content.deleted_at IS NULL')
      .andWhere('content.is_active = 1');

    // 🔵 لو عنده instituteId (يعني INST_ADMIN)
    if (role === 'INST_ADMIN' && instituteId) {
      query.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }

    query
      .leftJoin(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('content.contentCategory', 'category')
      .leftJoin(
        'category.translations',
        'categoryTranslation',
        languageId ? 'categoryTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('content.createdBy', 'createdBy')
      .select([
        'DISTINCT content.id AS content_id',
        'content.image AS content_image',
        'content.level AS content_level',
        'content.rate AS content_rate',
        'content.is_active AS content_isActive',
        'content.created_at AS content_createdAt',
        'translation.name AS translation_name',
        'translation.description AS translation_description',
        'translation.what_to_learn AS translation_what_to_learn',
        'category.id AS category_id',
        'categoryTranslation.name AS categoryTranslation_name',
        'createdBy.id AS created_by_id',
        'createdBy.full_name AS created_by_full_name',
      ]);

    const rows = await query.getRawMany<contentRow>();

    return rows.map((r) => ({
      id: r.content_id,
      name: r.translation_name,
      description: r.translation_description,
      image: r.content_image,
      level: r.content_level,
      rate: r.content_rate,
      isActive: r.content_isActive,
      createdAt: r.content_createdAt,
      whatToLearn: r.translation_what_to_learn,
      categoryId: r.category_id,
      categoryName: r.categoryTranslation_name,
      createdBy: r.created_by_id
        ? { id: r.created_by_id, name: r.created_by_full_name }
        : null,
    }));
  }

  /** ----------------------------------------------------------------
   * ✅ عرض محتوى واحد بالتفصيل
   * ---------------------------------------------------------------- */
  async findOne(id: number) {
    const content = await this.contentRepo
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.contentCategory', 'category')
      .leftJoinAndSelect('category.translations', 'categoryTranslation')
      .leftJoinAndSelect('categoryTranslation.language', 'categoryLanguage')
      .leftJoinAndSelect('content.createdBy', 'createdBy')
      .where('content.id = :id', { id })
      .getOne();

    if (!content) throw new NotFoundException('Content not found');

    return {
      id: content.id,
      image: content.image,
      level: content.level,
      rate: content.rate,
      is_active: content.is_active,

      translations: content.translations.map((t) => ({
        name: t.name,
        description: t.description,
        whatToLearn: t.what_to_learn,
      })),

      category: {
        id: content.contentCategory.id,
        translations: content.contentCategory.translations.map((ct) => ({
          name: ct.name,
        })),
      },
      createdBy: content.createdBy
        ? { id: content.createdBy.id, name: content.createdBy.full_name }
        : null,
    };
  }

  /** ----------------------------------------------------------------
   * ✅ تحديث المحتوى (مع الترجمات فقط)
   * ---------------------------------------------------------------- */
  async update(id: number, dto: UpdateContentDto, image?: Express.Multer.File) {
    const content = await this.contentRepo.findOne({
      where: { id },
      relations: ['translations'],
    });
    if (!content) throw new NotFoundException('Content not found');
    const baseUrl = process.env.BASE_URL || '';
    if (image) {
      const imageUrl = `${baseUrl}/uploads/content-images/${image.filename}`;
      content.image = imageUrl;
    }
    Object.assign(content, {
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
  async assignToCourse(contentId: number, courseId: number) {
    const content = await this.contentRepo.findOneBy({ id: contentId });
    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    const course = await this.courseRepo.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const exist = await this.courseContentRepo.findOne({
      where: {
        content: { id: contentId },
        course: { id: courseId },
      },
      withDeleted: true,
    });

    if (exist && !exist.deleted_at) {
      throw new ConflictException(
        `Content already assigned to course ${courseId}`,
      );
    }

    if (exist && exist.deleted_at) {
      await this.courseContentRepo.restore(exist.id);
      await this.courseContentRepo.update(exist.id, { is_active: 1 });
      return { message: 'Content restored successfully' };
    }

    await this.courseContentRepo.save(
      this.courseContentRepo.create({
        content: { id: contentId },
        course: { id: courseId },
        is_active: 1,
      }),
    );

    return { message: 'Content assigned successfully' };
  }

  /** ----------------------------------------------------------------
   * ✅ إزالة الربط بين محتوى وكورسات (unassign)
   * ---------------------------------------------------------------- */
  async removeFromCourses(contentId: number, courseIds: number[]) {
    if (!courseIds?.length) {
      throw new BadRequestException('courseIds must be provided');
    }

    for (const courseId of courseIds) {
      const link = await this.courseContentRepo.findOne({
        where: {
          content: { id: contentId },
          course: { id: courseId },
        },
        withDeleted: true,
      });

      if (!link) {
        throw new NotFoundException(
          `No ContentCourse link found for content ${contentId} with course ${courseId}`,
        );
      }

      // ✔️ already soft-deleted
      if (link.deleted_at) {
        continue;
      }

      await this.courseContentRepo.softDelete(link.id);
    }

    return { message: 'Content unassigned from courses successfully' };
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
  // ================= Trending – Paginated =================
  async findTrendingPaginated(
    page = 1,
    limit = 8,
    languageId?: number,
    instituteId?: number,
    programId?: number,
    userId?: number, // اختياري
  ) {
    const offset = (page - 1) * limit;

    // 1) IDs مرتبة حسب عدد الـ enrollments
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
    const countMap = new Map<number, number>(
      ids.map((id, i) => [id, Number(pageRows[i].cnt)]),
    );
    const orderIndex = new Map<number, number>(ids.map((id, i) => [id, i]));

    // 2) متوسط التقييم → خزّنه في content.rate
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

    // 3) المدة + عدّاد المقيمين
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

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // 4) فلاج الالتحاق (يكفي وجود صف)
    let enrolledMap = new Map<
      number,
      { isEnrolled: boolean; isCompleted: boolean }
    >();

    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select([
          'en.contentId AS cid',
          'CASE WHEN en.status = 1 THEN 1 ELSE 0 END AS completed',
        ])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number; completed: number }>();

      enrolledMap = new Map(
        enrRows.map((r) => [
          Number(r.cid),
          {
            isEnrolled: true,
            isCompleted: r.completed === 1,
          },
        ]),
      );
    }
    const savedMap = await this.buildSavedMap(userId, ids);

    // 5) حمّل تفاصيل المحتويات + ترجمات التصنيف والـ educator
    const contents = await this.contentRepo
      .createQueryBuilder('c')
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
      .leftJoinAndSelect('c.educator', 'educator')
      .leftJoinAndSelect('educator.user', 'eduUser')
      .where('c.id IN (:...ids)', { ids })
      .getMany();

    contents.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const items = contents.map((c) => {
      const tr =
        c.translations.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.translations[0];

      const catTr =
        c.contentCategory?.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.contentCategory?.translations?.[0];
      const enrollInfo = enrolledMap.get(c.id);
      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,

        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,

        isEnrolled: enrollInfo?.isEnrolled ?? false,
        isCompleted: enrollInfo?.isCompleted ?? false,
        isSaved: savedMap.get(c.id) ?? false,

        educator: c.educator
          ? {
              id: c.educator.id,
              title: c.educator.title,
              name: c.educator.user?.full_name ?? '',
            }
          : null,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
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
    userId?: number, // اختياري
  ) {
    // 1) هات أعلى 8 محتويات حسب عدد الـ enrollments مع تطبيق فلاتر المعهد/البرنامج
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
    const countMap = new Map<number, number>(
      rows.map((r) => [Number(r.id), Number(r.cnt)]),
    );
    const orderIndex = new Map<number, number>(ids.map((id, i) => [id, i]));

    // 2) احسب المتوسطات وحدّث content.rate
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

    // 3) مدة المحتوى + عدد المقيمين
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

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // 4) فلاج الالتحاق (يكفي وجود صف في enrollments)
    let enrolledMap = new Map<
      number,
      { isEnrolled: boolean; isCompleted: boolean }
    >();

    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select([
          'en.contentId AS cid',
          'CASE WHEN en.status = 1 THEN 1 ELSE 0 END AS completed',
        ])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number; completed: number }>();

      enrolledMap = new Map(
        enrRows.map((r) => [
          Number(r.cid),
          {
            isEnrolled: true,
            isCompleted: r.completed === 1,
          },
        ]),
      );
    }
    const savedMap = await this.buildSavedMap(userId, ids);

    // 5) حمّل تفاصيل المحتويات + ترجمات التصنيف والـ educator
    const contents = await this.contentRepo
      .createQueryBuilder('c')
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
      .leftJoinAndSelect('c.educator', 'educator')
      .leftJoinAndSelect('educator.user', 'eduUser')
      .where('c.id IN (:...ids)', { ids })
      .getMany();

    contents.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    return contents.map((c) => {
      const tr =
        c.translations.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.translations[0];

      const catTr =
        c.contentCategory?.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.contentCategory?.translations?.[0];
      const enrollInfo = enrolledMap.get(c.id);
      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,

        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        isEnrolled: enrollInfo?.isEnrolled ?? false,
        isCompleted: enrollInfo?.isCompleted ?? false,
        isSaved: savedMap.get(c.id) ?? false,

        educator: c.educator
          ? {
              id: c.educator.id,
              title: c.educator.title,
              name: c.educator.user?.full_name ?? '',
            }
          : null,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        enrollmentsCount: countMap.get(c.id) ?? 0,
      };
    });
  }

  // داخل ContentsService

  async assignContentToPackage(packageId: number, contentId: number) {
    // 1️⃣ تأكد إن الـ package موجود
    const pkg = await this.packageRepo.findOne({
      where: { id: packageId },
    });
    if (!pkg) {
      throw new NotFoundException(`Package ${packageId} not found`);
    }

    // 2️⃣ تأكد إن الـ content موجود
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    // 3️⃣ افحص الربط (مع soft delete)
    const existing = await this.packageContentRepo.findOne({
      where: {
        package: { id: packageId },
        content: { id: contentId },
      },
      withDeleted: true,
    });

    // ✔️ موجود ومفعل
    if (existing && !existing.deleted_at) {
      throw new ConflictException('Content already assigned to this package');
    }

    // ✔️ موجود لكن soft-deleted → restore
    if (existing && existing.deleted_at) {
      await this.packageContentRepo.restore(existing.id);
      await this.packageContentRepo.update(existing.id, {
        is_active: 1,
      });

      return {
        message: 'Content re-assigned to package successfully',
        packageId,
        contentId,
      };
    }

    // ✔️ مش موجود → create
    await this.packageContentRepo.save(
      this.packageContentRepo.create({
        package: { id: packageId },
        content: { id: contentId },
        is_active: 1,
      }),
    );

    return {
      message: 'Content assigned to package successfully',
      packageId,
      contentId,
    };
  }

  async unAssignContentFromPackage(packageId: number, contentId: number) {
    const link = await this.packageContentRepo.findOne({
      where: {
        package: { id: packageId },
        content: { id: contentId },
      },
      withDeleted: true,
    });

    if (!link) {
      throw new NotFoundException(
        `No content-package link found for package ${packageId} and content ${contentId}`,
      );
    }

    // ✔️ already soft-deleted (idempotent)
    if (link.deleted_at) {
      return {
        message: 'Content already unassigned from package',
        packageId,
        contentId,
      };
    }

    await this.packageContentRepo.softDelete(link.id);

    return {
      message: 'Content unassigned from package successfully',
      packageId,
      contentId,
    };
  }

  // أحدث الدورات – Paginated (8/صفحة) + فلترة بالمعهد/البرنامج
  async findLatestPaginated(
    page = 1,
    limit = 8,
    languageId?: number,
    instituteId?: number,
    programId?: number,
    userId?: number, // 👈 جديد لاستخراج isEnrolled
  ) {
    const skip = (page - 1) * limit;

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

    if (!rows.length) {
      const totalPages = Math.ceil(total / limit);
      return {
        items: [],
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

    // ids للباكتش-حسابات
    const ids = rows.map((c) => c.id);

    // 1) المدة الكلية + عدّاد المقيمين (rating>0)
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

    // 2) فلاج التحاق المستخدم (لو متاح userId)
    let enrolledMap = new Map<
      number,
      { isEnrolled: boolean; isCompleted: boolean }
    >();

    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select([
          'en.contentId AS cid',
          'CASE WHEN en.status = 1 THEN 1 ELSE 0 END AS completed',
        ])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number; completed: number }>();

      enrolledMap = new Map(
        enrRows.map((r) => [
          Number(r.cid),
          {
            isEnrolled: true,
            isCompleted: r.completed === 1,
          },
        ]),
      );
    }

    const savedMap = await this.buildSavedMap(userId, ids);

    const items = rows.map((c) => {
      const tr =
        c.translations?.find((t) => t.language?.id === languageId) ||
        c.translations?.[0];
      const catTr =
        c.contentCategory?.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.contentCategory?.translations?.[0];
      const enrollInfo = enrolledMap.get(c.id);
      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,

        // 👇 الحقول المضافة
        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        isEnrolled: enrollInfo?.isEnrolled ?? false,
        isCompleted: enrollInfo?.isCompleted ?? false,
        isSaved: savedMap.get(c.id) ?? false,

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
    instituteId?: number,
    programId?: number,
    userId?: number, // 👈 جديد
  ) {
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
      .orderBy('c.created_at', 'DESC')
      .take(8);

    if (instituteId) {
      qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }
    if (programId) {
      qb.andWhere('ipc.programId = :programId', { programId });
    }

    const rows = await qb.getMany();
    if (!rows.length) return [];

    const ids = rows.map((c) => c.id);

    // مدة + عدّاد المقيمين
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

    // فلاج التحاق
    let enrolledMap = new Map<
      number,
      { isEnrolled: boolean; isCompleted: boolean }
    >();

    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select([
          'en.contentId AS cid',
          'CASE WHEN en.status = 1 THEN 1 ELSE 0 END AS completed',
        ])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids })
        .getRawMany<{ cid: number; completed: number }>();

      enrolledMap = new Map(
        enrRows.map((r) => [
          Number(r.cid),
          {
            isEnrolled: true,
            isCompleted: r.completed === 1,
          },
        ]),
      );
    }

    const savedMap = await this.buildSavedMap(userId, ids);

    return rows.map((c) => {
      const tr =
        c.translations?.find((t) => t.language?.id === languageId) ||
        c.translations?.[0];
      const catTr =
        c.contentCategory?.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.contentCategory?.translations?.[0];
      const enrollInfo = enrolledMap.get(c.id);
      return {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image,
        level: c.level,

        // 👇 الحقول المضافة
        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        isEnrolled: enrollInfo?.isEnrolled ?? false,
        isCompleted: enrollInfo?.isCompleted ?? false,
        isSaved: savedMap.get(c.id) ?? false,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        created_at: c.created_at,
      };
    });
  }

  // أحدث دورة واحدة (للمعهد/البرنامج بتوع المستخدم)
  async findLatestOneForUser(
    instituteId: number,
    programId?: number,
    languageId?: number,
    userId?: number, // 👈 أضفنا userId
  ) {
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

    // ✅ فلاج isEnrolled
    let isEnrolled = false;
    let isCompleted = false;
    if (userId) {
      const enr = await this.enrollmentRepo.findOne({
        where: { user: { id: userId }, content: { id: row.id } },
      });
      if (enr) {
        isEnrolled = true;
        if (enr.status == 1) {
          isCompleted = true;
        }
      }
    }
    let isSaved = false;
    if (userId) {
      // لو TypeORM >= 0.3 يدعم getExists()
      const exists = await this.savedContentRepo
        .createQueryBuilder('s')
        .leftJoin('s.user', 'u')
        .leftJoin('s.content', 'c')
        .where('u.id = :uid', { uid: userId })
        .andWhere('c.id = :cid', { cid: row.id })
        .getExists(); // إن لم تتوفر، استخدم getCount()>0
      isSaved = exists;
    }

    const e = row.educator;
    const tr =
      row.translations?.find((t) => t.language?.id === languageId) ||
      row.translations?.[0];

    const catTr =
      row.contentCategory?.translations?.find(
        (t: any) =>
          t?.language?.id === languageId || t?.languageId === languageId,
      ) || row.contentCategory?.translations?.[0];

    return {
      id: row.id,
      ad_video: row.adVideo,
      name: tr?.name ?? '',
      description: tr?.description ?? '',
      image: row.image,
      level: row.level,
      rate: row.rate,
      whatToLearn: tr?.what_to_learn?.split(',') ?? [],
      category: {
        id: row.contentCategory?.id ?? null,
        name: catTr?.name ?? '',
      },
      created_at: row.created_at,
      isEnrolled, // 👈 الفلاج الجديد
      isSaved,
      isCompleted,

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
    const [content, educator] = await Promise.all([
      this.contentRepo.findOne({
        where: { id: contentId },
        relations: ['educator'],
      }),
      this.educatorRepo.findOne({
        where: { id: educatorId },
        relations: ['user'],
      }),
    ]);

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    if (!educator) {
      throw new NotFoundException(`Educator ${educatorId} not found`);
    }

    // ✔️ لو نفس المدرس متعيّن بالفعل
    if (content.educator?.id === educatorId) {
      return {
        message: 'Educator already assigned to content',
        contentId,
        educatorId,
      };
    }

    // ✔️ assign
    content.educator = educator;
    await this.contentRepo.save(content);

    return {
      message: 'Educator assigned to content successfully',
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

    if (!content) {
      throw new NotFoundException(`Content ${contentId} not found`);
    }

    // ✔️ already unassigned (idempotent)
    if (!content.educator) {
      return {
        message: 'Educator already unassigned from content',
        contentId,
      };
    }

    content.educator = null;
    await this.contentRepo.save(content);

    return {
      message: 'Educator unassigned from content successfully',
      contentId,
    };
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

  async contentsNav({
    instituteId,
    programId,
    languageId,
    limitPerCategory = 5,
  }: {
    instituteId?: number;
    programId?: number;
    languageId?: number;
    limitPerCategory?: number;
  }) {
    const qb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoin(
        'c.courseContents',
        'cc',
        'cc.deleted_at IS NULL AND cc.is_active = 1',
      )
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .where('c.deleted_at IS NULL')
      .andWhere('c.is_active = 1');

    // 🔵 نفس منطق Trending بالظبط
    if (instituteId) {
      qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }

    if (programId) {
      qb.andWhere('ipc.programId = :programId', { programId });
    }

    qb.leftJoinAndSelect(
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
      .leftJoinAndSelect('c.educator', 'edu')
      .leftJoinAndSelect('edu.user', 'eduUser')
      .orderBy('c.created_at', 'DESC');

    const rows = await qb.getMany();

    if (!rows.length) return { categories: [] };

    // 🔹 group by category
    const byCategory = new Map<number, typeof rows>();

    for (const c of rows) {
      const catId = c.contentCategory?.id ?? 0;
      const arr = byCategory.get(catId) ?? [];
      arr.push(c);
      byCategory.set(catId, arr);
    }

    const categories = Array.from(byCategory.entries()).map(([catId, arr]) => {
      const catTr =
        arr[0].contentCategory?.translations?.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || arr[0].contentCategory?.translations?.[0];

      const items = arr.slice(0, limitPerCategory).map((c) => {
        const tr =
          c.translations.find(
            (t: any) =>
              t?.language?.id === languageId || t?.languageId === languageId,
          ) || c.translations[0];

        return {
          id: c.id,
          name: tr?.name ?? '',
          image: c.image ?? null,
          educator: c.educator
            ? {
                id: c.educator.id,
                title: c.educator.title,
                name: c.educator.user?.full_name ?? '',
              }
            : null,
        };
      });

      return {
        id: catId || null,
        name: catId === 0 ? 'General' : (catTr?.name ?? ''),
        items,
      };
    });

    categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return { categories };
  }

  async findCompletedPaginatedForUser(
    userId: number,
    languageId?: number,
    page = 1,
    limit = 8,
    instituteId?: number,
    programId?: number,
  ) {
    const offset = (page - 1) * limit;

    // 1) IDs لكل الـ contents اللي اليوزر مكمّلها (status = 1)
    // + آخر enrollment id ليه على كل محتوى (نستخدمها للترتيب بدل updated_at)
    const baseQb = this.enrollmentRepo
      .createQueryBuilder('en')
      .innerJoin('en.content', 'c')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .select('c.id', 'contentId')
      .addSelect('MAX(en.id)', 'lastEnrollId') // 👈 بدل MAX(en.updated_at)
      .where('en.userId = :uid', { uid: userId })
      .andWhere('en.status = 1'); // completed فقط

    if (instituteId) {
      baseQb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }
    if (programId) {
      baseQb.andWhere('ipc.programId = :programId', { programId });
    }

    const allRows = await baseQb
      .groupBy('c.id')
      .orderBy('lastEnrollId', 'DESC') // 👈 الترتيب بأحدث enrollment
      .getRawMany<{ contentId: number; lastEnrollId: string }>();

    const total = allRows.length;
    if (!total) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const pageRows = await baseQb
      .groupBy('c.id')
      .orderBy('lastEnrollId', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany<{ contentId: number; lastEnrollId: string }>();

    if (!pageRows.length) {
      const totalPages = Math.ceil(total / limit);
      return {
        items: [],
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

    const ids = pageRows.map((r) => Number(r.contentId));
    const orderIndex = new Map<number, number>(ids.map((id, i) => [id, i]));

    // 2) إجمالي عدد الـ enrollments لكل محتوى (كل المستخدمين) = enrollmentsCount
    const countRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect('COUNT(e.id)', 'cnt')
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: number; cnt: string }>();

    const countMap = new Map<number, number>(
      countRows.map((r) => [Number(r.id), Number(r.cnt)]),
    );

    // 3) احسب المتوسطات وحدّث content.rate
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

    // 4) مدة المحتوى + عدد المقيمين (rating > 0)
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

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // 5) isEnrolled: بما إنهم completed لليوزر ده → أكيد true
    const enrolledMap = new Map<number, boolean>(ids.map((id) => [id, true]));

    // isSaved للمستخدم الحالي
    const savedMap = await this.buildSavedMap(userId, ids);

    // 6) حمّل تفاصيل المحتويات + ترجمات التصنيف والـ educator
    const contents = await this.contentRepo
      .createQueryBuilder('c')
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
      .leftJoinAndSelect('c.educator', 'educator')
      .leftJoinAndSelect('educator.user', 'eduUser')
      .where('c.id IN (:...ids)', { ids })
      .getMany();

    // الحفاظ على ترتيب الـ pageRows
    contents.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const items = contents.map((c) => {
      const tr =
        c.translations.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.translations[0];

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
        isSaved: savedMap.get(c.id) ?? false,

        educator: c.educator
          ? {
              id: c.educator.id,
              title: c.educator.title,
              name: c.educator.user?.full_name ?? '',
            }
          : null,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        enrollmentsCount: countMap.get(c.id) ?? 0,
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
  async findInProgressConntentForUser(
    userId: number,
    languageId?: number,
    page = 1,
    limit = 8,
    instituteId?: number,
    programId?: number,
  ) {
    const offset = (page - 1) * limit;

    // 1) IDs لكل الـ contents اللي اليوزر مكمّلها (status = 1)
    // + آخر enrollment id ليه على كل محتوى (نستخدمها للترتيب بدل updated_at)
    const baseQb = this.enrollmentRepo
      .createQueryBuilder('en')
      .innerJoin('en.content', 'c')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .select('c.id', 'contentId')
      .addSelect('MAX(en.id)', 'lastEnrollId') // 👈 بدل MAX(en.updated_at)
      .where('en.userId = :uid', { uid: userId })
      .andWhere('en.status = 0'); // completed فقط

    if (instituteId) {
      baseQb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    }
    if (programId) {
      baseQb.andWhere('ipc.programId = :programId', { programId });
    }

    const allRows = await baseQb
      .groupBy('c.id')
      .orderBy('lastEnrollId', 'DESC') // 👈 الترتيب بأحدث enrollment
      .getRawMany<{ contentId: number; lastEnrollId: string }>();

    const total = allRows.length;
    if (!total) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    const pageRows = await baseQb
      .groupBy('c.id')
      .orderBy('lastEnrollId', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany<{ contentId: number; lastEnrollId: string }>();

    if (!pageRows.length) {
      const totalPages = Math.ceil(total / limit);
      return {
        items: [],
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

    const ids = pageRows.map((r) => Number(r.contentId));
    const orderIndex = new Map<number, number>(ids.map((id, i) => [id, i]));

    // 2) إجمالي عدد الـ enrollments لكل محتوى (كل المستخدمين) = enrollmentsCount
    const countRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect('COUNT(e.id)', 'cnt')
      .where('c.id IN (:...ids)', { ids })
      .groupBy('c.id')
      .getRawMany<{ id: number; cnt: string }>();

    const countMap = new Map<number, number>(
      countRows.map((r) => [Number(r.id), Number(r.cnt)]),
    );

    // 3) احسب المتوسطات وحدّث content.rate
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

    // 4) مدة المحتوى + عدد المقيمين (rating > 0)
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

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // 5) isEnrolled: بما إنهم completed لليوزر ده → أكيد true
    const enrolledMap = new Map<number, boolean>(ids.map((id) => [id, true]));

    // isSaved للمستخدم الحالي
    const savedMap = await this.buildSavedMap(userId, ids);

    // 6) حمّل تفاصيل المحتويات + ترجمات التصنيف والـ educator
    const contents = await this.contentRepo
      .createQueryBuilder('c')
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
      .leftJoinAndSelect('c.educator', 'educator')
      .leftJoinAndSelect('educator.user', 'eduUser')
      .where('c.id IN (:...ids)', { ids })
      .getMany();

    // الحفاظ على ترتيب الـ pageRows
    contents.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const items = contents.map((c) => {
      const tr =
        c.translations.find(
          (t: any) =>
            t?.language?.id === languageId || t?.languageId === languageId,
        ) || c.translations[0];

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
        isSaved: savedMap.get(c.id) ?? false,

        educator: c.educator
          ? {
              id: c.educator.id,
              title: c.educator.title,
              name: c.educator.user?.full_name ?? '',
            }
          : null,

        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        enrollmentsCount: countMap.get(c.id) ?? 0,
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
  async toggleActive(contentId: number) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content)
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    const contentStatus = (content.is_active = content.is_active ? 0 : 1);
    await this.contentRepo.save(content);
    return {
      message: `Content with ID ${contentId} is now ${
        contentStatus ? 'active' : 'inactive'
      }.`,
      id: contentId,
      isActive: contentStatus,
    };
  }
  async contentDropDown(courseId: number, languageId?: number) {
    const query = this.contentRepo
      .createQueryBuilder('content')

      // 🔴 JOIN على course_content لنفس الكورس
      .leftJoin(
        'course_content',
        'CC',
        'CC.contentId = content.id AND CC.courseId = :courseId',
        { courseId },
      )

      // 🔴 استبعد المحتوى اللي already assigned
      .where('CC.id IS NULL')

      .leftJoin(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')

      .select([
        'content.id AS content_id',
        'translation.name AS translation_name',
      ]);

    const rows = await query.getRawMany<contentRow>();

    return rows.map((r) => ({
      id: r.content_id,
      name: r.translation_name,
    }));
  }

  async ContentsForCourseList(courseId: number, languageId?: number) {
    const query = this.courseContentRepo
      .createQueryBuilder('CC')
      .leftJoin('CC.course', 'course')
      .where('course.id = :courseId', { courseId })

      // ❌ نشيل الـ soft-deleted links
      .andWhere('CC.deleted_at IS NULL')

      .leftJoin('CC.content', 'content')

      .leftJoin(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')

      .select([
        'content.id AS content_id',
        'translation.name AS translation_name',
      ]);

    const rows = await query.getRawMany<contentRow>();

    return rows.map((r) => ({
      id: r.content_id,
      name: r.translation_name,
    }));
  }
  async contentsForPackagesList(packageId: number, languageId?: number) {
    const query = this.packageContentRepo
      .createQueryBuilder('PC')

      // 🔴 فلترة على الـ package
      .leftJoin('PC.package', 'package')
      .where('package.id = :packageId', { packageId })

      // 🔴 نشيل الـ soft-deleted links
      .andWhere('PC.deleted_at IS NULL')

      // 🔴 join على content
      .leftJoin('PC.content', 'content')

      // 🔴 translations
      .leftJoin(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')

      .select([
        'content.id AS content_id',
        'translation.name AS translation_name',
      ]);

    const rows = await query.getRawMany<contentRow>();

    return rows.map((r) => ({
      id: r.content_id,
      name: r.translation_name,
    }));
  }

  async contentsForEducatorList(educatorId: number, languageId?: number) {
    const query = this.contentRepo
      .createQueryBuilder('content')

      // 🔴 فلترة على المدرّس
      .where('content.educatorId = :educatorId', { educatorId })

      .leftJoin(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')

      .select([
        'content.id AS content_id',
        'translation.name AS translation_name',
      ]);

    const rows = await query.getRawMany<contentRow>();

    return rows.map((r) => ({
      id: r.content_id,
      name: r.translation_name,
    }));
  }
  async contentsUnassignedForEducatorDropDown(languageId?: number) {
    const query = this.contentRepo
      .createQueryBuilder('content')

      // 🔴 لسه مش مرتبط بمدرّس
      .where('content.educatorId IS NULL')

      .leftJoin(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')

      .select([
        'content.id AS content_id',
        'translation.name AS translation_name',
      ]);

    const rows = await query.getRawMany<contentRow>();

    return rows.map((r) => ({
      id: r.content_id,
      name: r.translation_name,
    }));
  }
  async contentsForPackageDropDown(packageId: number, languageId?: number) {
    const query = this.contentRepo
      .createQueryBuilder('content')

      // 🔴 join على package_content
      .leftJoin(
        'package_content',
        'PC',
        `
        PC.content_id = content.id
        AND PC.package_id = :packageId
        AND PC.deleted_at IS NULL
      `,
        { packageId },
      )

      // 🔴 نشيل اللي متضافة فعليًا
      .where('PC.id IS NULL')

      // 🔴 translations
      .leftJoin(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')

      .select([
        'content.id AS content_id',
        'translation.name AS translation_name',
      ]);

    const rows = await query.getRawMany<contentRow>();

    return rows.map((r) => ({
      id: r.content_id,
      name: r.translation_name,
    }));
  }
  async countContents(
    instituteId?: number,
    programId?: number,
    currentUserInstituteId?: number,
    role?: string,
  ) {
    const isInstituteAdmin = role === 'INST_ADMIN';

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : instituteId;

    const qb = this.contentRepo
      .createQueryBuilder('content')
      .leftJoin(
        'content.courseContents',
        'cc',
        'cc.deleted_at IS NULL AND cc.is_active != 0',
      )
      .leftJoin('cc.course', 'course')
      .leftJoin(
        'course.instituteProgramCourses',
        'ipc',
        'ipc.deleted_at IS NULL AND ipc.is_active != 0',
      )
      .where('content.deleted_at IS NULL');

    if (scopedInstituteId !== undefined && scopedInstituteId !== null) {
      qb.andWhere('ipc.instituteId = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    if (programId !== undefined && programId !== null) {
      qb.andWhere('ipc.programId = :programId', { programId });
    }

    const row = await qb
      .select('COUNT(DISTINCT content.id)', 'totalContents')
      .getRawOne<{ totalContents: string }>();

    return {
      totalContents: Number(row?.totalContents ?? 0),
    };
  }
}
