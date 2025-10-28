// src/contents/content-details.service.ts
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { ContentReview } from 'src/content-reviews/entities/content-review.entity';

type AccessFlag = 'notLoggedIn' | 'notEnrolled' | 'enrolled';

@Injectable()
export class ContentDetailsService {
  constructor(
    @InjectRepository(Content) private readonly contentRepo: Repository<Content>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(ContentReview) private readonly reviewRepo: Repository<ContentReview>,
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
  async getBase(contentId: number, params: { languageId?: number; instituteId?: number; programId?: number }) {
    await this.ensureContentScope(contentId, params);

    const qb = this.baseContentQuery(params.languageId)
      .leftJoinAndSelect('content.educator', 'educator')
      .leftJoinAndSelect('educator.user', 'eduUser')
      .where('content.id = :id', { id: contentId });

    const content = await qb.getOne();
    if (!content) throw new NotFoundException();

    const ctr = content.translations?.[0] ?? null;

    return {
      id: content.id,
      image: content.image ?? null,
      adVideo: content.adVideo ?? null,
      name: ctr?.name || '',
      description: ctr?.description || '',
      levelName: ctr?.level_name || '',
      whatToLearn: ctr?.what_to_learn || '',
      educator: content.educator
        ? {
            id: content.educator.id,
            title: content.educator.title,
            bio: content.educator.bio,
            image: content.educator.image,
            firstName: content.educator.user?.full_name?.split(' ')?.[0] ?? '',
            lastName: content.educator.user?.full_name?.split(' ')?.slice(1)?.join(' ') ?? '',
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
    const isEnrolled = !!enr && enr.status === 1;
    return {
      access: isEnrolled ? ('enrolled' as AccessFlag) : ('notEnrolled' as AccessFlag),
      enrollmentId: enr?.id ?? null,
    };
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
