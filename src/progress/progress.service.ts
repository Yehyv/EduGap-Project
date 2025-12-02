import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from 'express';
import { Lesson, LessonType } from 'src/lessons/entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonsService } from 'src/lessons/lessons.service';
import { Content } from 'src/contents/entities/content.entity';
@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    @Inject(forwardRef(() => LessonsService))
    private readonly lessonsService: LessonsService,
    @InjectRepository(Content) private contentRepo: Repository<Content>, // 👈
  ) {}

  async completeLesson(lessonId: number, userId: number) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['topic', 'topic.content'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // ⛔ منع استخدام الـ endpoint ده مع الكويز
    if (lesson.lesson_type === LessonType.QUESTIONS) {
      throw new BadRequestException(
        'Cannot complete a quiz lesson via this endpoint. Submit the quiz instead.',
      );
    }

    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: lesson.topic.content.id } },
      select: ['id', 'status'],
    });
    if (!enrollment)
      throw new ForbiddenException('Not enrolled in this course');

    const { prev, next, contentId } =
      await this.lessonsService.getPrevAndNextInContent(lessonId);

    if (prev) {
      const prevCompleted = await this.progressRepo.exist({
        where: {
          lesson: { id: prev.id },
          enrollment: { id: enrollment.id },
          user: { id: userId },
        },
      });
      if (!prevCompleted) {
        throw new BadRequestException('Previous lesson not completed');
      }
    }

    try {
      const entity = this.progressRepo.create({
        lesson: { id: lesson.id },
        enrollment: { id: enrollment.id },
        user: { id: userId },
      });
      await this.progressRepo.save(entity);
    } catch (_) {
      // already exists -> ignore
    }

    if (!next) {
      const totalLessons = await this.lessonRepo
        .createQueryBuilder('l')
        .innerJoin('l.topic', 't')
        .innerJoin('t.content', 'c')
        .where('c.id = :cid', { cid: contentId })
        .getCount();

      const completedLessons = await this.progressRepo
        .createQueryBuilder('p')
        .where('p.enrollment_id = :enrollId', { enrollId: enrollment.id })
        .andWhere('p.user_id = :userId', { userId })
        .getCount();

      if (totalLessons > 0 && completedLessons >= totalLessons) {
        await this.enrollRepo.update(enrollment.id, { status: 1 });
      }
    }

    return {
      completedLessonId: lesson.id,
      nextLesson: next
        ? {
            id: next.id,
            order_id: next.order_id,
            isUnlocked: true,
          }
        : null,
    };
  }

  async getContentProgress(contentId: number, userId: number) {
    // 1) تأكد إن المستخدم مُسجَّل في هذا المحتوى
    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
      select: ['id'],
    });
    if (!enrollment)
      throw new ForbiddenException('Not enrolled in this content');

    // 2) إجمالي عدد الدروس في هذا المحتوى
    const totalLessons = await this.lessonRepo
      .createQueryBuilder('l')
      .innerJoin('l.topic', 't')
      .innerJoin('t.content', 'c')
      .where('c.id = :cid', { cid: contentId })
      .getCount();

    // 3) عدد الدروس المكتملة لهذا الـenrollment
    // بما إن الـenrollment مربوط بالمحتوى نفسه، نقدر نعتمد عليه مباشرة
    const completedLessons = await this.progressRepo
      .createQueryBuilder('p')
      .where('p.enrollment_id = :enrollId', { enrollId: enrollment.id })
      .andWhere('p.user_id = :userId', { userId })
      .getCount();

    const percent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return {
      contentId,
      totalLessons,
      completedLessons,
      percent, // 0..100
    };
  }
  async findResumeLessonsPaginated(
    userId: number,
    languageId?: number,
    page = 1,
    limit = 8,
  ) {
    const offset = (page - 1) * limit;

    // 1) IDs للـ enrollments اللي عندها progress لليوزر (distinct, ordered)
    const baseQb = this.progressRepo
      .createQueryBuilder('p')
      .leftJoin('p.enrollment', 'en')
      .select('p.enrollment_id', 'enrollId')
      .addSelect('MAX(p.created_at)', 'lastAt')
      .where('p.user_id = :uid', { uid: userId })
      .andWhere('en.status = 0') // بس اللي مُكتملة
      .groupBy('p.enrollment_id')
      .orderBy('lastAt', 'DESC');

    const allRows = await baseQb.getRawMany<{
      enrollId: number;
      lastAt: string;
    }>();
    const total = allRows.length;

    const pageRows = await baseQb
      .limit(limit)
      .offset(offset)
      .getRawMany<{ enrollId: number; lastAt: string }>();

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

    const enrollmentIds = pageRows.map((r) => Number(r.enrollId));

    // 2) هات الـ enrollments + contentId + userRating
    const enrollments = await this.enrollRepo.find({
      where: { id: In(enrollmentIds), status: 0, user: { id: userId } },
      select: ['id', 'rating'],
      relations: [
        'content',
        'content.educator',
        'content.educator.user',
        'content.translations',
      ],
    });

    // خرائط مساعدة
    const enrollIdToContentId = new Map<number, number>();
    const enrollIdToUserRating = new Map<number, number>();
    const contentIds: number[] = [];

    for (const en of enrollments) {
      const cid = en.content?.id;
      if (cid) {
        enrollIdToContentId.set(en.id, cid);
        enrollIdToUserRating.set(en.id, en.rating ?? 0);
        contentIds.push(cid);
      }
    }

    if (!contentIds.length) {
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

    // 3) اسم المحتوى بالمترجم المختار (لو languageId)
    // (الـ enrollments اللي فوق already محمّل فيها translations/educator)

    // 4) كل دروس المحتويات دي مرتبة على مستوى المحتوى كله (topic → order → id)
    const lessons = await this.lessonRepo
      .createQueryBuilder('l')
      .leftJoin('l.topic', 't')
      .leftJoin('t.content', 'c')
      .leftJoinAndSelect(
        'l.translations',
        'ltr',
        languageId ? 'ltr.languageId = :languageId' : undefined,
        { languageId },
      )
      .where('c.id IN (:...ids)', { ids: contentIds })
      .select([
        'l.id',
        'l.order_id',
        'l.video_link',
        't.id',
        'c.id',
        'ltr.id',
        'ltr.name',
      ])
      .orderBy('t.id', 'ASC')
      .addOrderBy('l.order_id', 'ASC')
      .addOrderBy('l.id', 'ASC')
      .getMany();

    const lessonsByContent = new Map<number, Lesson[]>();
    for (const l of lessons) {
      // TypeORM بيرجع العلاقات جوه الـ entity، بس هنا أخدنا select خفيف، فنستفيد من join alias
      const cid = l.topic?.content?.id ?? (l as any).c?.id;
      const arr = lessonsByContent.get(cid) ?? [];
      arr.push(l);
      lessonsByContent.set(cid, arr);
    }

    // 5) progress rows لهذه الـ enrollments (علشان نحدد المكتمل)
    const progressRows = await this.progressRepo
      .createQueryBuilder('p')
      .select(['p.enrollment_id AS enrollId', 'p.lesson_id AS lessonId'])
      .where('p.user_id = :uid', { uid: userId })
      .andWhere('p.enrollment_id IN (:...enrIds)', { enrIds: enrollmentIds })
      .getRawMany<{ enrollId: number; lessonId: number }>();

    const completedByEnroll = new Map<number, Set<number>>();
    for (const r of progressRows) {
      const eId = Number(r.enrollId);
      const set = completedByEnroll.get(eId) ?? new Set<number>();
      set.add(Number(r.lessonId));
      completedByEnroll.set(eId, set);
    }

    // 6) متوسط التقييم + عدد المقيمين (per content)
    const ratingAggRows = await this.enrollRepo
      .createQueryBuilder('en')
      .select('en.contentId', 'contentId')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(AVG(NULLIF(en.rating, 0)), 0)', 'avg')
      .where('en.contentId IN (:...ids)', { ids: contentIds })
      .groupBy('en.contentId')
      .getRawMany<{ contentId: string; count: string; avg: string }>();

    const ratingAvg = new Map<number, number>();
    const ratingCnt = new Map<number, number>();
    for (const r of ratingAggRows) {
      ratingAvg.set(Number(r.contentId), Number(r.avg ?? 0));
      ratingCnt.set(Number(r.contentId), Number(r.count ?? 0));
    }

    // 7) كوّن العناصر (نفس أسلوبك: rows.map بدل push لتفادي never[])
    const items = enrollments
      .map((en) => {
        const cid = en.content?.id;
        if (!cid) return null;

        const contentLessons = lessonsByContent.get(cid) ?? [];
        const completedSet = completedByEnroll.get(en.id) ?? new Set<number>();

        const totalLessons = contentLessons.length;
        const completedLessons = contentLessons.filter((L) =>
          completedSet.has(L.id),
        ).length;

        // أول درس غير مكتمل = عليه الدور (لازم يكون مفتوح by design لأننا نمشي ترتيب المحتوى)
        const next = contentLessons.find((L) => !completedSet.has(L.id));
        if (!next) return null; // كله خلص ⇒ مش هيظهر في الفيد

        const percent =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const trContent =
          en.content?.translations?.find(
            (t: any) =>
              t?.language?.id === languageId || t?.languageId === languageId,
          ) || en.content?.translations?.[0];

        const educatorName = en.content?.educator?.user?.full_name ?? '';
        const [firstName, ...rest] = educatorName.split(' ');
        const lastName = rest.join(' ');

        return {
          lesson: {
            id: next.id,
            order: next.order_id ?? 0,
            lesson_type: next.lesson_type ?? null,
            name: next.translations?.[0]?.name ?? '',
            video: next.video_link ?? null,
          },
          content: {
            id: cid,
            name: trContent?.name ?? '',
          },
          educator: en.content?.educator
            ? {
                id: en.content.educator.id,
                title: en.content.educator.title,
                firstName: firstName ?? '',
                lastName: lastName ?? '',
              }
            : null,
          rating: {
            userRating: en.rating ?? 0,
            averageRating: ratingAvg.get(cid) ?? 0,
            ratingsCount: ratingCnt.get(cid) ?? 0,
          },
          stats: {
            totalLessons,
            completedLessons,
            percent,
          },
        };
      })
      .filter(Boolean); // شيل المحتويات اللي خلصت بالكامل

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
}
