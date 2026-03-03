import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository, In } from 'typeorm';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Content } from 'src/contents/entities/content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { User } from 'src/users/entities/user.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { LessonType } from 'src/lessons/entities/lesson.entity';
@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollRepo: Repository<Enrollment>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private progressRepo: Repository<LessonProgress>,
    @InjectRepository(Content)
    private contentRepo: Repository<Content>,
    @InjectRepository(InstituteProgramCourse)
    private readonly ipcRepo: Repository<InstituteProgramCourse>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  async getOverallProgressPercentage(userId: number) {
    // 1) كل enrollments للمستخدم (in progress + completed)
    const enrollments = await this.enrollRepo.find({
      where: { user: { id: userId } },
      select: ['id', 'status'],
      relations: ['content'],
    });

    if (!enrollments.length) {
      return { percentage: 0 };
    }

    // اجمع contentIds + map enrollment -> content
    const enrollmentIds: number[] = [];
    const contentIds: number[] = [];
    const enrollmentToContent = new Map<number, number>();
    const enrollmentStatus = new Map<number, number>();

    for (const en of enrollments) {
      const cid = en.content?.id;
      if (!cid) continue;

      enrollmentIds.push(en.id);
      contentIds.push(cid);
      enrollmentToContent.set(en.id, cid);
      enrollmentStatus.set(en.id, en.status ?? 0);
    }

    if (!contentIds.length) {
      return { percentage: 0 };
    }

    // 2) عدد الدروس لكل content
    const lessonCountRows = await this.lessonRepo
      .createQueryBuilder('l')
      .innerJoin('l.topic', 't')
      .innerJoin('t.content', 'c')
      .select('c.id', 'contentId')
      .addSelect('COUNT(l.id)', 'totalLessons')
      .where('c.id IN (:...contentIds)', { contentIds })
      .groupBy('c.id')
      .getRawMany<{ contentId: string; totalLessons: string }>();

    const totalLessonsMap = new Map<number, number>(
      lessonCountRows.map((r) => [Number(r.contentId), Number(r.totalLessons)]),
    );

    // 3) عدد الدروس المكتملة لكل enrollment
    const completedRows = await this.progressRepo
      .createQueryBuilder('p')
      .select('p.enrollment_id', 'enrollmentId')
      .addSelect('COUNT(p.id)', 'completedLessons')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.enrollment_id IN (:...enrollmentIds)', { enrollmentIds })
      .groupBy('p.enrollment_id')
      .getRawMany<{ enrollmentId: string; completedLessons: string }>();

    const completedMap = new Map<number, number>(
      completedRows.map((r) => [
        Number(r.enrollmentId),
        Number(r.completedLessons),
      ]),
    );

    // 4) احسب نسبة كل content ثم المتوسط العام
    let sumPercent = 0;
    let countedContents = 0;

    for (const en of enrollments) {
      const cid = en.content?.id;
      if (!cid) continue;

      const totalLessons = totalLessonsMap.get(cid) ?? 0;

      // استبعاد المحتوى اللي مفيهوش دروس
      if (totalLessons <= 0) continue;

      let percent = 0;

      // لو مكتمل من enrollment status
      if ((en.status ?? 0) === 1) {
        percent = 100;
      } else {
        const completedLessons = completedMap.get(en.id) ?? 0;
        percent = Math.round((completedLessons / totalLessons) * 100);
      }

      sumPercent += percent;
      countedContents += 1;
    }

    if (countedContents === 0) {
      return { percentage: 0 };
    }

    const percentage = Math.round(sumPercent / countedContents);

    return { percentage };
  }
  async getPassedExamsCount(userId: number) {
    const passedExams = await this.progressRepo
      .createQueryBuilder('p')
      .innerJoin('p.lesson', 'l')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('l.lesson_type = :quizType', { quizType: 1 }) // LessonType.QUESTIONS
      .andWhere('l.deleted_at IS NULL')
      .getCount();

    return { passedExams };
  }
  private pickTranslation<T extends { language?: { id?: number } }>(
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

  async getStudentContentsProgress(
    userId: number,
    languageId?: number,
  ): Promise<{
    count: number;
    items: Array<{
      contentId: number;
      name: string;
      percentage: number;
      startDate: Date | null;
    }>;
  }> {
    // 1) كل enrollments للمستخدم + content + translations
    const enrollments = await this.enrollRepo.find({
      where: { user: { id: userId } },
      select: ['id', 'status', 'created_at'], // ✅ تأكد إن created_at موجود في Entity
      relations: [
        'content',
        'content.translations',
        'content.translations.language',
      ],
      order: { created_at: 'ASC' }, // لو TypeORM عندك اشتكى شيل السطر ده
    });

    if (!enrollments.length) {
      return { count: 0, items: [] };
    }

    // لو حصل duplicate enrollments لنفس المحتوى (نظريًا المفروض لأ)
    // هنختار الأقدم created_at ونفس الوقت نفضل status=1 لو موجود
    const byContent = new Map<number, (typeof enrollments)[number]>();

    for (const en of enrollments) {
      const cid = en.content?.id;
      if (!cid) continue;

      const prev = byContent.get(cid);
      if (!prev) {
        byContent.set(cid, en);
        continue;
      }

      const prevDate = prev.created_at
        ? new Date(prev.created_at).getTime()
        : Infinity;
      const currDate = en.created_at
        ? new Date(en.created_at).getTime()
        : Infinity;

      // احتفظ بالأقدم كـ startDate، لكن لو واحد completed والتاني لا نفضل الـ completed
      if ((prev.status ?? 0) !== 1 && (en.status ?? 0) === 1) {
        // ننقل status/record الجديد لكن نحافظ على أقدم تاريخ لو أقدم موجود في prev
        if (prevDate < currDate) {
          (en as any).created_at = prev.created_at;
        }
        byContent.set(cid, en);
      } else if (currDate < prevDate) {
        byContent.set(cid, en);
      }
    }

    const uniqueEnrollments = Array.from(byContent.values());
    const contentIds = uniqueEnrollments.map((en) => en.content.id);
    const enrollmentIds = uniqueEnrollments.map((en) => en.id);

    // 2) إجمالي عدد الدروس لكل content (active + not deleted)
    const totalLessonsRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't', 't.deleted_at IS NULL AND t.is_active != 0')
      .leftJoin('t.lessons', 'l', 'l.deleted_at IS NULL AND l.is_active != 0')
      .select('c.id', 'contentId')
      .addSelect('COUNT(DISTINCT l.id)', 'totalLessons')
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ contentId: string; totalLessons: string }>();

    const totalLessonsMap = new Map<number, number>(
      totalLessonsRows.map((r) => [
        Number(r.contentId),
        Number(r.totalLessons),
      ]),
    );

    // 3) عدد الدروس المكتملة لكل enrollment (distinct lesson)
    const completedRows = await this.progressRepo
      .createQueryBuilder('lp')
      .select('lp.enrollment_id', 'enrollmentId')
      .addSelect('COUNT(DISTINCT lp.lesson_id)', 'completedLessons')
      .where('lp.user_id = :uid', { uid: userId })
      .andWhere('lp.deleted_at IS NULL')
      .andWhere('lp.enrollment_id IN (:...enrIds)', { enrIds: enrollmentIds })
      .groupBy('lp.enrollment_id')
      .getRawMany<{ enrollmentId: string; completedLessons: string }>();

    const completedMap = new Map<number, number>(
      completedRows.map((r) => [
        Number(r.enrollmentId),
        Number(r.completedLessons),
      ]),
    );

    // 4) بناء العناصر + استبعاد المحتوى بدون دروس
    const items = uniqueEnrollments
      .map((en) => {
        const c = en.content;
        const totalLessons = totalLessonsMap.get(c.id) ?? 0;

        // استبعاد المحتوى بدون دروس (حسب اتفاقنا)
        if (totalLessons <= 0) return null;

        let percentage = 0;

        if ((en.status ?? 0) === 1) {
          percentage = 100;
        } else {
          const completedLessons = completedMap.get(en.id) ?? 0;
          percentage =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;
        }

        const tr = this.pickTranslation<{
          language?: { id?: number };
          name?: string;
        }>(c.translations as any[], languageId);

        return {
          contentId: c.id,
          name: tr?.name ?? '',
          percentage,
          startDate: en.created_at ?? null,
        };
      })
      .filter(Boolean) as Array<{
      contentId: number;
      name: string;
      percentage: number;
      startDate: Date | null;
    }>;

    return {
      count: items.length,
      items,
    };
  }
  async getStudentCoursesOutOfProgramCourses(userId: number): Promise<{
    studentCourses: number;
    totalProgramCourses: number;
    percentage: number;
  }> {
    // 1) هات المستخدم + institute + program
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['institute', 'program'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const instituteId = user.institute?.id;
    const programId = user.program?.id;

    // لو المستخدم مش مربوط بمعهد/برنامج
    if (!instituteId || !programId) {
      return {
        studentCourses: 0,
        totalProgramCourses: 0,
        percentage: 0,
      };
    }

    // 2) إجمالي الكورسات المتاحة للطالب في البرنامج (IPC)
    const totalProgramCourses = await this.ipcRepo
      .createQueryBuilder('ipc')
      .select('COUNT(DISTINCT ipc.courseId)', 'cnt')
      .where('ipc.instituteId = :instituteId', { instituteId })
      .andWhere('ipc.programId = :programId', { programId })
      .andWhere('ipc.is_active != 0')
      .andWhere('ipc.deleted_at IS NULL')
      .getRawOne<{ cnt: string }>()
      .then((r) => Number(r?.cnt ?? 0));

    if (totalProgramCourses === 0) {
      return {
        studentCourses: 0,
        totalProgramCourses: 0,
        percentage: 0,
      };
    }

    // 3) عدد الكورسات اللي الطالب بدأ فيها فعليًا
    // logic:
    // enrollment (user -> content) -> course_content (content -> course) -> ipc (available course)
    const studentCourses = await this.enrollRepo
      .createQueryBuilder('en')
      .innerJoin('en.content', 'content')
      .innerJoin(
        'course_content',
        'cc',
        'cc.contentId = content.id AND cc.deleted_at IS NULL AND cc.is_active != 0',
      )
      .innerJoin(
        'institute_program_course',
        'ipc',
        `
          ipc.courseId = cc.courseId
          AND ipc.instituteId = :instituteId
          AND ipc.programId = :programId
          AND ipc.is_active != 0
          AND ipc.deleted_at IS NULL
        `,
        { instituteId, programId },
      )
      .where('en.userId = :userId', { userId })
      .select('COUNT(DISTINCT cc.courseId)', 'cnt')
      .getRawOne<{ cnt: string }>()
      .then((r) => Number(r?.cnt ?? 0));

    const percentage =
      totalProgramCourses > 0
        ? Math.round((studentCourses / totalProgramCourses) * 100)
        : 0;

    return {
      studentCourses,
      totalProgramCourses,
      percentage,
    };
  }
  async getPassedExamResults(userId: number, languageId?: number) {
    // 1) كل الـ quiz lessons اللي عندها progress للمستخدم = exams passed
    const passedRows = await this.progressRepo
      .createQueryBuilder('p')
      .innerJoin('p.lesson', 'l')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL')
      .andWhere('l.lesson_type = :quizType', { quizType: LessonType.QUESTIONS })
      .andWhere('l.deleted_at IS NULL')
      .select([
        'l.id AS lessonId',
        'MIN(p.created_at) AS passedAt', // أول مرة نجح فيها
      ])
      .groupBy('l.id')
      .orderBy('passedAt', 'DESC')
      .getRawMany<{ lessonId: string; passedAt: string }>();

    if (!passedRows.length) {
      return { count: 0, items: [] };
    }

    const lessonIds = passedRows.map((r) => Number(r.lessonId));
    const passedAtMap = new Map<number, string>(
      passedRows.map((r) => [Number(r.lessonId), r.passedAt]),
    );

    // 2) هات تفاصيل الدروس + الترجمات + الأسئلة
    const lessons = await this.lessonRepo.find({
      where: { id: In(lessonIds) }, // هنرتب تحت
      relations: ['translations', 'translations.language', 'questions'],
    });

    // لو where: { id: In(lessonIds) } أفضل عندك:
    // import { In } from 'typeorm';
    // where: { id: In(lessonIds) }

    // ترتيب حسب passedAt desc زي passedRows
    const orderIndex = new Map<number, number>(
      lessonIds.map((id, i) => [id, i]),
    );
    lessons.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const items = lessons.map((lesson) => {
      const tr = this.pickTranslation<{
        language?: { id?: number };
        name?: string;
      }>(lesson.translations as any[], languageId);

      const totalQuestions =
        lesson.questions?.filter((q: any) => q.is_active !== 0 && !q.deleted_at)
          .length ?? 0;

      return {
        lessonId: lesson.id,
        examName: tr?.name ?? '',
        totalQuestions,
        passPercent: lesson.questions_percentage_score ?? 0,
        passedAt: passedAtMap.get(lesson.id) ?? null,
        result: 'Passed',
      };
    });

    return {
      count: items.length,
      items,
    };
  }
}
