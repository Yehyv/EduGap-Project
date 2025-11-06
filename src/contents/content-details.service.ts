// src/contents/content-details.service.ts
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { ContentReview } from 'src/content-reviews/entities/content-review.entity';
import { PrerequisiteContent } from 'src/prerequiest-contents/entities/prerequiest-content.entity';
import { formatHumanDate } from 'src/common/date-format';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
type AccessFlag = 'notLoggedIn' | 'notEnrolled' | 'enrolled';

@Injectable()
export class ContentDetailsService {
  constructor(
    @InjectRepository(Content) private readonly contentRepo: Repository<Content>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(ContentReview) private readonly reviewRepo: Repository<ContentReview>,
    @InjectRepository(PrerequisiteContent) private readonly prereqRepo: Repository<PrerequisiteContent>,
    @InjectRepository(Lesson) private readonly lessonRepo: Repository<Lesson>,                    // ⬅️ جديد
    @InjectRepository(LessonProgress) private readonly progressRepo: Repository<LessonProgress>, // ⬅️ جديد
  ) {}

  /** Helper: يضمن ان الـcontent موجود ومتاح داخل معهد/برنامج (لو اتبعتوا) */
  private async ensureContentScope(
    contentId: number,
    scope?: { instituteId?: number; programId?: number },
  ) {
    const qb = this.contentRepo
      .createQueryBuilder('content')
      .leftJoin('content.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .where('content.id = :id', { id: contentId });

    if (typeof scope?.instituteId === 'number') qb.andWhere('ipc.instituteId = :instituteId', { instituteId: scope.instituteId });
    if (typeof scope?.programId === 'number') qb.andWhere('ipc.programId = :programId', { programId: scope.programId });

    const found = await qb.getOne();
    if (!found) throw new NotFoundException(`Content ${contentId} not found or not accessible`);
    return found;
  }

  /** Helper: Query أساسي مرن للترجمات */
  private baseContentQuery(languageId?: number) {
    return this.contentRepo
      .createQueryBuilder('content')
      .leftJoinAndSelect(
        'content.translations',
        'ctr',
        languageId ? 'ctr.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('ctr.language', 'ctrLang');
  }

  /** 1) بيانات المحتوى الأساسية + educator */
  async getBase(
  contentId: number,
  params: { languageId?: number; instituteId?: number; programId?: number }
) {
  await this.ensureContentScope(contentId, params);

  // 1) استعلام الأساس (بدون تجميعة)
  const qb = this.baseContentQuery(params.languageId)
    .leftJoinAndSelect('content.educator', 'educator')
    .leftJoinAndSelect('educator.user', 'eduUser')
    .where('content.id = :id', { id: contentId });

  const content = await qb.getOne();
  if (!content) throw new NotFoundException();

  // 2) إجمالي مدة الدروس لهذا الـ content مع مراعاة فلاتر المعهد/البرنامج
  const durRow = await this.contentRepo
    .createQueryBuilder('c')
    .leftJoin('c.topics', 't')
    .leftJoin('t.lessons', 'l')
    .leftJoin('c.courseContents', 'cc')
    .leftJoin('cc.course', 'course')
    .leftJoin('course.instituteProgramCourses', 'ipc')
    .select('COALESCE(SUM(l.duration), 0)', 'totalDuration')
    .where('c.id = :cid', { cid: contentId })
    .andWhere(params.instituteId ? 'ipc.instituteId = :instituteId' : '1=1', {
      instituteId: params.instituteId,
    })
    .andWhere(params.programId ? 'ipc.programId = :programId' : '1=1', {
      programId: params.programId,
    })
    .getRawOne<{ totalDuration: string }>();

  const totalDuration = Number(durRow?.totalDuration ?? 0);

  const ctr = content.translations?.[0] ?? null;
  const lastUpdate = formatHumanDate(content.updated_at);

  return {
    id: content.id,
    image: content.image ?? null,
    adVideo: content.adVideo ?? null,
    hasCertificate: content.has_certificate ?? null,
    name: ctr?.name || '',
    description: ctr?.description || '',
    levelName: ctr?.level_name || '',
    whatToLearn: ctr?.what_to_learn || '',
    previousBackground: ctr?.previous_background || '',
    languageType: ctr?.language_type || '',
    lastUpdate,
    totalDuration, // ⬅️ الإضافة الجديدة
    educator: content.educator
      ? {
          id: content.educator.id,
          title: content.educator.title,
          bio: content.educator.bio,
          image: content.educator.image,
          firstName:
            content.educator.user?.full_name?.split(' ')?.[0] ?? '',
          lastName:
            content.educator.user?.full_name
              ?.split(' ')
              ?.slice(1)
              ?.join(' ') ?? '',
        }
      : null,
  };
}


  /** 2) Topics + Lessons + durations */
  async getTopics(contentId: number, params: { languageId?: number }) {
    // هنا نجيب التوبيكس بالترجمة + الدروس بترجمتها
    const qb = this.contentRepo
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.topics', 'topic')
      .leftJoinAndSelect(
        'topic.translations',
        'ttr',
        params.languageId ? 'ttr.languageId = :languageId' : undefined,
        { languageId: params.languageId },
      )
      .leftJoinAndSelect('topic.lessons', 'lesson')
      .leftJoinAndSelect(
        'lesson.translations',
        'ltr',
        params.languageId ? 'ltr.languageId = :languageId' : undefined,
        { languageId: params.languageId },
      )
      .where('content.id = :id', { id: contentId });

    const c = await qb.getOne();
    if (!c) throw new NotFoundException();

    const topics = (c.topics ?? []).map((t) => {
      const ttr = t.translations?.[0] ?? null;
      const lessons = (t.lessons ?? []).map((l) => {
        const ltr = l.translations?.[0] ?? null;
        const duration = typeof l.duration === 'number' ? l.duration : 0;
        return { id: l.id, name: ltr?.name || '', duration };
      });
      const topicDuration = lessons.reduce((s, x) => s + (x.duration || 0), 0);
      return { id: t.id, name: ttr?.name || '', duration: topicDuration, lessons };
    });

    return topics;
  }

  /** 3) Ratings Histogram + Average + Count */
  async getRatings(contentId: number) {
    const ratingRows = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('e.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('e.contentId = :cid', { cid: contentId })
      .andWhere('e.rating > 0')
      .groupBy('e.rating')
      .getRawMany<{ rating: string; count: string }>();

    const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of ratingRows) {
      const r = Number(row.rating);
      if (r >= 1 && r <= 5) histogram[r] = Number(row.count);
    }
    const totalRaters = Object.values(histogram).reduce((a, b) => a + b, 0);
    const weightedSum = 1 * histogram[1] + 2 * histogram[2] + 3 * histogram[3] + 4 * histogram[4] + 5 * histogram[5];
    const average = totalRaters > 0 ? Number((weightedSum / totalRaters).toFixed(2)) : 0;

    return { histogram, average, totalRaters };
  }

  /** 4) Reviews (Pagination) */
  async getReviews(contentId: number, params: { page?: number; limit?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 2);
    const skip = (page - 1) * limit;

    const total = await this.reviewRepo
      .createQueryBuilder('cr')
      .where('cr.content = :cid', { cid: contentId })
      .getCount();

    const rows = await this.reviewRepo
      .createQueryBuilder('cr')
      .leftJoin('cr.user', 'u')
      .leftJoin('cr.content', 'c')
      .leftJoin(Enrollment, 'en', 'en.userId = u.id AND en.contentId = c.id')
      .select([
        'cr.id AS id',
        'cr.review AS review',
        "DATE_FORMAT(cr.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt", // MySQL
        'u.id AS userId',
        'u.full_name AS fullName',
        'u.user_image AS userImage',
        'en.rating AS rating',
      ])
      .where('cr.content = :cid', { cid: contentId })
      .orderBy('cr.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getRawMany<{
        id: number; review: string; createdAt: string;
        userId: number; fullName: string; userImage: string; rating: number | null;
      }>();

    const reviews = rows.map(r => ({
      id: r.id,
      review: r.review,
      createdAt: r.createdAt,
      user: { id: r.userId, full_name: r.fullName, image: r.userImage },
      rating: r.rating ?? 0,
    }));

    return {
      reviews,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /** 5) Access flag + enrollmentId */
  async getAccess(contentId: number, params: { userId?: number }) {
    const isLoggedIn = !!params.userId;
    if (!isLoggedIn) return { access: 'notLoggedIn' as AccessFlag, enrollmentId: null };

    const enr = await this.enrollmentRepo.findOne({
      where: { user: { id: params.userId }, content: { id: contentId } },
      select: ['id', 'status', 'rating'],
    });
    const isEnrolled = !!enr;
    return {
      access: isEnrolled ? ('enrolled' as AccessFlag) : ('notEnrolled' as AccessFlag),
      enrollmentId: enr?.id ?? null,
    };
  }
  async getContentPrerequisites(
  contentId: number,
  params: {
    languageId?: number;
    instituteId?: number;
    programId?: number;
    userId?: number;
  } = {},
) {
  const { languageId, instituteId, programId, userId } = params;

  // 0) تأكيد وجود المحتوى
  const content = await this.contentRepo.findOne({ where: { id: contentId } });
  if (!content) throw new NotFoundException('Content not found');

  // 1) هات كل الـ prerequisites (هنحتاج الـ type)
  const prereqRows = await this.prereqRepo.find({
    where: { content: { id: contentId } },
    relations: ['prerequisiteContent'],
    order: { id: 'ASC' },
  });
  if (!prereqRows.length) {
    return {
      items: [],
      count: 0,
    };
  }

  // IDs المطلوبة + خرائط للمساعدة
  const ids = prereqRows
    .map((r) => r?.prerequisiteContent?.id ?? r?.prerequisiteContentId ?? r?.prerequisiteContentId)
    .filter((x: any) => x != null);

  const typeMap = new Map<number, number>(
    prereqRows.map((r: any) => [
      Number(r?.prerequisiteContent?.id ?? r?.prerequisiteContentId ?? r?.prerequisiteContentId),
      Number(r.type),
    ]),
  );

  const orderIndex = new Map<number, number>(ids.map((id, i) => [Number(id), i]));

  // 2) enrollmentsCount (عدد المسجّلين) مع احترام معهد/برنامج إن حبيت
  // هنعدّ من جدول enrollments مباشرة (أسرع من الجوين الطويل)،
  // ولو محتاج تقصر على معهد/برنامج، نقدر نفلتر عبر join على course/ipc زي التريندينج.
  // هنا هنعمل نسخة مختصرة + اختيارية للقيود:
  const enrQb = this.enrollmentRepo
    .createQueryBuilder('e')
    .select('e.contentId', 'id')
    .addSelect('COUNT(e.id)', 'cnt')
    .where('e.contentId IN (:...ids)', { ids })
    .groupBy('e.contentId');

  // (اختياري) فلترة بمعهد/برنامج عبر ربط enrollments -> content -> courseContent -> course -> ipc
  if (instituteId || programId) {
    enrQb
      .innerJoin(Content, 'c', 'c.id = e.contentId')
      .innerJoin('c.courseContents', 'cc')
      .innerJoin('cc.course', 'course')
      .innerJoin('course.instituteProgramCourses', 'ipc', 'ipc.deleted_at IS NULL AND ipc.is_active != 0');
    if (instituteId) enrQb.andWhere('ipc.instituteId = :instituteId', { instituteId });
    if (programId) enrQb.andWhere('ipc.programId = :programId', { programId });
  }

  const enrRows = await enrQb.getRawMany<{ id: string; cnt: string }>();
  const enrollmentsCountMap = new Map<number, number>(
    enrRows.map((r) => [Number(r.id), Number(r.cnt)]),
  );

  // 3) متوسط التقييم + ratersCount
  const ratingRows = await this.enrollmentRepo
    .createQueryBuilder('e2')
    .select('e2.contentId', 'id')
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
    .addSelect('SUM(CASE WHEN e2.rating > 0 THEN 1 ELSE 0 END)', 'ratersCount')
    .where('e2.contentId IN (:...ids)', { ids })
    .groupBy('e2.contentId')
    .getRawMany<{ id: string; avg: string; ratersCount: string }>();

  const avgMap = new Map<number, number>(
    ratingRows.map((r) => [Number(r.id), Number(r.avg)]),
  );
  const ratersMap = new Map<number, number>(
    ratingRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
  );

  // (اختياري) لو عايز تُحدّث content.rate زي التريندينج:
  // for (const [cid, avg] of avgMap) {
  //   await this.contentRepo.update({ id: cid }, { rate: avg });
  // }

  // 4) totalDuration (SUM durations)
  const durRows = await this.contentRepo
    .createQueryBuilder('c')
    .leftJoin('c.topics', 't')
    .leftJoin('t.lessons', 'l')
    .select('c.id', 'id')
    .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
    .where('c.id IN (:...ids)', { ids })
    .groupBy('c.id')
    .getRawMany<{ id: string; totalDuration: string }>();

  const durationMap = new Map<number, number>(
    durRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
  );

  // 5) فلاج isEnrolled (لو userId متاح)
  let enrolledMap = new Map<number, boolean>();
  if (userId) {
    const userEnrRows = await this.enrollmentRepo
      .createQueryBuilder('en')
      .select(['en.contentId AS cid'])
      .where('en.userId = :uid', { uid: userId })
      .andWhere('en.contentId IN (:...ids)', { ids })
      .getRawMany<{ cid: number }>();
    enrolledMap = new Map(userEnrRows.map((r) => [Number(r.cid), true]));
  }

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

  // احفظ ترتيب النتائج مثل ترتيب الـ prerequisites
  contents.sort(
    (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
  );

  // 7) بناء النتيجة بنفس شكل findTrendingPaginated + إضافة type
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

    const enrollmentsCount = enrollmentsCountMap.get(c.id) ?? 0;
    const rate = avgMap.get(c.id) ?? c.rate ?? 0;

    return {
      id: c.id,
      name: tr?.name ?? '',
      description: tr?.description ?? '',
      image: c.image,
      level: c.level,

      rate,
      ratersCount: ratersMap.get(c.id) ?? 0,
      totalDuration: durationMap.get(c.id) ?? 0,

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
      category: {
        id: c.contentCategory?.id ?? null,
        name: catTr?.name ?? '',
      },
      enrollmentsCount,

      // 👇 إضافة النوع من جدول prerequisites: 0 optional / 1 mandatory
      type: typeMap.get(c.id) ?? 0,
    };
  });

  return {
    items,
    count: items.length,
  };
}
async getContentSummary(
    contentId: number,
    params: { languageId?: number; instituteId?: number; programId?: number } = {},
  ) {
    // 1) هات المحتوى + ترجمة واحدة حسب اللغة (خفيف)
    const qb = this.contentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect(
        'c.translations',
        'ctr',
        params.languageId ? 'ctr.languageId = :languageId' : '1=1',
        { languageId: params.languageId },
      )
      .where('c.id = :cid', { cid: contentId })
      .select([
        'c.id',
        // نرجّع ترجمة واحدة فقط (لو في أكثر من ترجمة بدون languageId، أول عنصر هتاخده من المصفوفة)
        'ctr.id',
        'ctr.name',
      ]);

    const content = await qb.getOne();
    if (!content) throw new NotFoundException('Content not found');

    // 2) احسب إجمالي المدة مع فلترة المعهد/البرنامج (نفس منطقك في getBase)
    const durRow = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .leftJoin('c.courseContents', 'cc')
      .leftJoin('cc.course', 'course')
      .leftJoin('course.instituteProgramCourses', 'ipc')
      .select('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .where('c.id = :cid', { cid: contentId })
      .andWhere(params.instituteId ? 'ipc.instituteId = :instituteId' : '1=1', {
        instituteId: params.instituteId,
      })
      .andWhere(params.programId ? 'ipc.programId = :programId' : '1=1', {
        programId: params.programId,
      })
      .getRawOne<{ totalDuration: string }>();

    const totalDuration = Number(durRow?.totalDuration ?? 0);

    const displayName =
      content.translations?.[0]?.name ??
      ''; // لو عايز fallback آخر، زوّده هنا

    return {
      id: content.id,
      name: displayName,
      totalDuration,
    };
  }
  async getNextOpenLessonId(
  contentId: number,
  userId: number,
): Promise<{ lessonId: number | null }> {
  // 0) لازم يكون ملتحق بالمحتوى ده
  const enrollment = await this.enrollmentRepo.findOne({
    where: { user: { id: userId }, content: { id: contentId } },
    select: ['id'],
  });
  // لو مش ملتحق، هنرجّع null بدل ما نرمى Forbidden عشان الـUI يتصرف ببساطة
  if (!enrollment) return { lessonId: null };

  // 1) هات IDs الدروس مرتبة بالترتيب الطبيعي (topic ثم order ثم id)
  const lessonRows = await this.lessonRepo
    .createQueryBuilder('l')
    .leftJoin('l.topic', 't')
    .leftJoin('t.content', 'c')
    .where('c.id = :cid', { cid: contentId })
    .select(['l.id AS id'])
    .orderBy('t.id', 'ASC')
    .addOrderBy('l.order_id', 'ASC')
    .addOrderBy('l.id', 'ASC')
    .getRawMany<{ id: number }>();

  if (!lessonRows.length) return { lessonId: null };
  const orderedIds = lessonRows.map(r => Number(r.id));

  // 2) هات الدروس المكتملة للمستخدم داخل نفس الـenrollment
  const completedRows = await this.progressRepo
    .createQueryBuilder('p')
    .select(['p.lesson_id AS lessonId'])
    .where('p.enrollment_id = :enrollId', { enrollId: enrollment.id })
    .andWhere('p.user_id = :userId', { userId })
    .getRawMany<{ lessonId: number }>();

  const completed = new Set(completedRows.map(r => Number(r.lessonId)));

  // 3) أول درس غير مكتمل ومسموح (الأول أو يلي درسًا مكتملًا)
  let nextId: number | null = null;
  for (let i = 0; i < orderedIds.length; i++) {
    const cur = orderedIds[i];
    if (completed.has(cur)) continue;
    const isFirst = i === 0;
    const prevCompleted = isFirst ? true : completed.has(orderedIds[i - 1]);
    if (isFirst || prevCompleted) {
      nextId = cur;
      break;
    }
  }

  return { lessonId: nextId };
}
}

// // src/contents/content-details.service.ts
// /* eslint-disable prettier/prettier */
// import {
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { Content } from './entities/content.entity';
// import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
// import { ContentReview } from 'src/content-reviews/entities/content-review.entity';

// @Injectable()
// export class ContentDetailsService {
//   constructor(
//     @InjectRepository(Content)
//     private readonly contentRepo: Repository<Content>,
//     @InjectRepository(Enrollment)
//     private readonly enrollmentRepo: Repository<Enrollment>,
//     @InjectRepository(ContentReview)
//     private readonly reviewRepo: Repository<ContentReview>,
//   ) {}

//   /** Query أساسى بالمترجمات والعلاقات اللى هنحتاجها */
//   // ✅ نسخة مصححة من الـ baseContentQuery
// private baseContentQuery(languageId?: number) {
//   return this.contentRepo
//     .createQueryBuilder('content')

//     // translations (اختياري بالـ languageId)
//     .leftJoinAndSelect(
//       'content.translations',
//       'ctr',
//       languageId ? 'ctr.languageId = :languageId' : undefined,
//       { languageId },
//     )
//     .leftJoinAndSelect('ctr.language', 'ctrLang')

//     // Topics + translations + Lessons + translations
//     .leftJoinAndSelect('content.topics', 'topic')
//     .leftJoinAndSelect(
//       'topic.translations',
//       'ttr',
//       languageId ? 'ttr.languageId = :languageId' : undefined,
//       { languageId },
//     )
//     .leftJoinAndSelect('topic.lessons', 'lesson')
//     .leftJoinAndSelect(
//       'lesson.translations',
//       'ltr',
//       languageId ? 'ltr.languageId = :languageId' : undefined,
//       { languageId },
//     )

//     .leftJoinAndSelect('content.reviews', 'rev')
//     .leftJoinAndSelect('rev.user', 'revUser')

//     // ✅ Educator (واحد لكل content)
//     .leftJoinAndSelect('content.educator', 'educator')
//     .leftJoinAndSelect('educator.user', 'eduUser')

//     // ✅ السلسلة الصحيحة للفلاتر: content -> courseContents -> course -> ipc
//     .leftJoin('content.courseContents', 'cc')
//     .leftJoin('cc.course', 'course')
//     .leftJoin('course.instituteProgramCourses', 'ipc')
//     .orderBy('rev.created_at', 'DESC');

// }


//   /**
//    * كل تفاصيل المحتوى + فلاج الحالة (notLoggedIn / notEnrolled / enrolled)
//    * @param id          contentId
//    * @param params      { userId?, instituteId?, programId?, languageId? }
//    */
//   /**
//  * كل تفاصيل المحتوى + فلاج الحالة (notLoggedIn / notEnrolled / enrolled)
//  * @param id          contentId
//  * @param params      { userId?, instituteId?, programId?, languageId?, reviewPage?, reviewLimit? }
//  */
// async getDetailsForUser(
//   id: number,
//   params: {
//     userId?: number;        // undefined = ضيف
//     instituteId?: number;   // من req.user
//     programId?: number;     // من query
//     languageId?: number;    // من header
//     reviewPage?: number;    // باجينيشن الريفيوز (افتراضي 1)
//     reviewLimit?: number;   // حجم الصفحة (افتراضي 2)
//   },
// ) {
//   const {
//     userId,
//     instituteId,
//     programId,
//     languageId,
//     reviewPage = 1,
//     reviewLimit = 2, // 👈 افتراضي 2 زي ما طلبت
//   } = params;

//   // 1) هات المحتوى وفلتر حسب المعهد/البرنامج لو مبعوتين
//   const qb = this.baseContentQuery(languageId).where('content.id = :id', { id });

//   if (typeof instituteId === 'number') {
//     qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
//   }
//   if (typeof programId === 'number') {
//     qb.andWhere('ipc.programId = :programId', { programId });
//   }

//   const content = await qb.getOne();
//   if (!content) {
//     throw new NotFoundException(`Content ${id} not found or not accessible`);
//   }

//   // 2) حالة الدخول/الالتحاق
//   const isLoggedIn = !!userId;
//   let isEnrolled = false;
//   let enrollmentId: number | null = null;

//   if (isLoggedIn) {
//     const enr = await this.enrollmentRepo.findOne({
//       where: { user: { id: userId }, content: { id } },
//       select: ['id', 'status', 'rating'],
//     });
//     isEnrolled = !!enr && enr.status === 1;
//     enrollmentId = enr?.id ?? null;
//   }

//   const accessFlag: 'notLoggedIn' | 'notEnrolled' | 'enrolled' = !isLoggedIn
//     ? 'notLoggedIn'
//     : isEnrolled
//     ? 'enrolled'
//     : 'notEnrolled';

//   // 3) نحسب الديوريشن لكل Topic (مجموع دروسه)، والدرس بياخد duration من الحقل
//   const topics = (content.topics ?? []).map((t) => {
//     const topicTranslation = t.translations?.[0] ?? null;

//     const lessons = (t.lessons ?? []).map((l) => {
//       const lessonTranslation = l.translations?.[0] ?? null;
//       const duration = typeof l.duration === 'number' ? l.duration : 0;
//       return {
//         id: l.id,
//         name: lessonTranslation?.name || '',
//         duration, // ثوانى خام
//       };
//     });

//     const topicDuration = lessons.reduce((sum, ll) => sum + (ll.duration || 0), 0);

//     return {
//       id: t.id,
//       name: topicTranslation?.name || '',
//       duration: topicDuration, // مجموع الدروس داخل التوبيك (ثوانى)
//       lessons,
//     };
//   });

//   // 4) تجميعة التقييمات (Histogram + Average + عدد المقيّمين)
//   const ratingRows = await this.enrollmentRepo
//     .createQueryBuilder('e')
//     .select('e.rating', 'rating')
//     .addSelect('COUNT(*)', 'count')
//     .where('e.contentId = :cid', { cid: id })
//     .andWhere('e.rating > 0')
//     .groupBy('e.rating')
//     .getRawMany<{ rating: string; count: string }>();

//   const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//   for (const row of ratingRows) {
//     const r = Number(row.rating);
//     if (r >= 1 && r <= 5) histogram[r] = Number(row.count);
//   }
//   const totalRaters = Object.values(histogram).reduce((a, b) => a + b, 0);
//   const weightedSum =
//     1 * histogram[1] +
//     2 * histogram[2] +
//     3 * histogram[3] +
//     4 * histogram[4] +
//     5 * histogram[5];
//   const averageRating =
//     totalRaters > 0 ? Number((weightedSum / totalRaters).toFixed(2)) : 0;

//   // 5) الريفيوز (باجينيشن: 2 في الصفحة افتراضيًا)
//   const skip = (reviewPage - 1) * reviewLimit;

//   // إجمالي عدد الريفيوز لهذا المحتوى
//   const totalReviews = await this.reviewRepo
//     .createQueryBuilder('cr')
//     .where('cr.content = :cid', { cid: id })
//     .getCount();

//   // نجيب الصفحة المطلوبة
//   const reviewsRaw = await this.reviewRepo
//     .createQueryBuilder('cr')
//     .leftJoin('cr.user', 'u')
//     .leftJoin('cr.content', 'c')
//     .leftJoin(Enrollment, 'en', 'en.userId = u.id AND en.contentId = c.id')
//     .select([
//       'cr.id AS id',
//       'cr.review AS review',
//       "DATE_FORMAT(cr.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt", // MySQL؛ لو Postgres استخدم to_char
//       'u.id AS userId',
//       'u.full_name AS fullName',
//       'u.user_image AS userImage',
//       'en.rating AS rating',
//     ])
//     .where('cr.content = :cid', { cid: id })
//     .orderBy('cr.created_at', 'DESC')
//     .skip(skip)
//     .take(reviewLimit)
//     .getRawMany<{
//       id: number;
//       review: string;
//       createdAt: string;
//       userId: number;
//       fullName: string;
//       userImage: string;
//       rating: number | null;
//     }>();

//   const reviews = reviewsRaw.map((r) => ({
//     id: r.id,
//     review: r.review,
//     createdAt: r.createdAt,
//     user: {
//       id: r.userId,
//       full_name: r.fullName,
//       image: r.userImage,
//     },
//     rating: r.rating ?? 0,
//   }));

//   const reviewsPagination = {
//     page: reviewPage,
//     limit: reviewLimit,
//     total: totalReviews,
//     totalPages: Math.ceil(totalReviews / reviewLimit),
//     hasNext: reviewPage * reviewLimit < totalReviews,
//     hasPrev: reviewPage > 1,
//   };

//   // 6) الترجمة المختارة على مستوى المحتوى
//   const ctr = content.translations?.[0] ?? null;

//   // 7) شكل الـ Response النهائى
//   return {
//     access: accessFlag,
//     enrollmentId,

//     content: {
//       id: content.id,
//       image: (content).image ?? null,
//       adVideo: (content).adVideo ?? null,
//       rate: averageRating,
//       numberOfReviewers: totalRaters,
//       levelName: (ctr)?.level_name || '',
//       whatToLearn: (ctr)?.what_to_learn || '',
//       name: ctr?.name || '',
//       description: ctr?.description || '',
//     },

//     topics,

//     educator: content.educator
//       ? {
//           id: content.educator.id,
//           title: content.educator.title,
//           bio: content.educator.bio,
//           image: content.educator.image,
//           firstName:
//             content.educator.user?.full_name?.split(' ')?.[0] ?? '',
//           lastName:
//             content.educator.user?.full_name?.split(' ')?.slice(1)?.join(' ') ??
//             '',
//         }
//       : null,

//     ratings: {
//       histogram,
//       average: averageRating,
//       totalRaters,
//     },

//     reviews,
//     reviewsPagination, // 👈 ميتاداتا الباجينيشن
//   };
// }

// }