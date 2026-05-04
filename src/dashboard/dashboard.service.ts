import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Content } from 'src/contents/entities/content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { User } from 'src/users/entities/user.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { LessonType } from 'src/lessons/entities/lesson.entity';
import {
  Certificate,
  CertificateType,
} from 'src/certificates/entities/certificate.entity';
import { PackageEnrollment } from 'src/package-enrollments/entities/package-enrollment.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { ContentCategory } from 'src/content-categories/entities/content-category.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Course } from 'src/courses/entities/course.entity';
type CountRow = {
  count: string | number;
};
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
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
    @InjectRepository(PackageEnrollment)
    private readonly packageEnrollmentRepo: Repository<PackageEnrollment>,
    @InjectRepository(Institute)
    private readonly instituteRepo: Repository<Institute>,
    @InjectRepository(ContentCategory)
    private readonly contentCategoryRepo: Repository<ContentCategory>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}
  private isInstituteAdminRole(role?: string) {
    return role === 'INST_ADMIN' || role === 'INSTITUTE_ADMIN';
  }
  private buildInstituteUsersQuery(instituteId: number) {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.UserRole', 'role')
      .where('institute.id = :instituteId', { instituteId });
  }
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
  private pickTranslationName(
    translations?: { name?: string; language?: { id: number } }[],
    languageId?: number,
  ) {
    if (!translations?.length) return null;

    const selectedTranslation = languageId
      ? translations.find(
          (translation) => translation.language?.id === languageId,
        )
      : translations[0];

    return selectedTranslation?.name ?? translations[0]?.name ?? null;
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
  private applyStudentScope(
    qb: SelectQueryBuilder<User>,
    instituteId?: number,
    programId?: number,
  ) {
    qb.innerJoin('user.UserRole', 'role')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.program', 'program')
      .where('user.deletedAt IS NULL')
      .andWhere('user.is_active = 1')
      .andWhere('LOWER(role.role_title) = :roleTitle', {
        roleTitle: 'student',
      });

    if (instituteId !== undefined && instituteId !== null) {
      qb.andWhere('institute.id = :instituteId', { instituteId });
    }

    if (programId !== undefined && programId !== null) {
      qb.andWhere('program.id = :programId', { programId });
    }

    return qb;
  }
  private applyStudentTrendScope(
    qb: SelectQueryBuilder<User>,
    instituteId?: number,
    programId?: number,
  ) {
    qb.innerJoin('user.UserRole', 'role')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.program', 'program')
      .where('user.deletedAt IS NULL')
      .andWhere("LOWER(role.role_title) = 'student'");

    if (instituteId !== undefined && instituteId !== null) {
      qb.andWhere('institute.id = :instituteId', { instituteId });
    }

    if (programId !== undefined && programId !== null) {
      qb.andWhere('program.id = :programId', { programId });
    }

    return qb;
  }

  async getStudentEngagementTrend(
    programId?: number,
    currentUserInstituteId?: number,
    role?: string,
  ) {
    const isInstituteAdmin =
      role === 'INST_ADMIN' || role === 'INSTITUTE_ADMIN';

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : undefined;

    const scopedProgramId = isInstituteAdmin ? programId : undefined;

    const now = new Date();
    const months: string[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1,
      0,
      0,
      0,
      0,
    );

    const newStudentsRows = await this.applyStudentTrendScope(
      this.userRepo.createQueryBuilder('user'),
      scopedInstituteId,
      scopedProgramId,
    )
      .andWhere('user.createdAt >= :startDate', { startDate })
      .select("DATE_FORMAT(user.createdAt, '%Y-%m')", 'month')
      .addSelect('COUNT(DISTINCT user.id)', 'count')
      .groupBy("DATE_FORMAT(user.createdAt, '%Y-%m')")
      .orderBy("DATE_FORMAT(user.createdAt, '%Y-%m')", 'ASC')
      .getRawMany<{ month: string; count: string }>();

    const activeStudentsRows = await this.enrollRepo
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.user', 'user')
      .innerJoin('user.UserRole', 'role')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.program', 'program')
      .where('user.deletedAt IS NULL')
      .andWhere("LOWER(role.role_title) = 'student'")
      .andWhere('enrollment.created_at >= :startDate', { startDate })
      .andWhere(
        scopedInstituteId !== undefined && scopedInstituteId !== null
          ? 'institute.id = :instituteId'
          : '1=1',
        scopedInstituteId !== undefined && scopedInstituteId !== null
          ? { instituteId: scopedInstituteId }
          : {},
      )
      .andWhere(
        scopedProgramId !== undefined && scopedProgramId !== null
          ? 'program.id = :programId'
          : '1=1',
        scopedProgramId !== undefined && scopedProgramId !== null
          ? { programId: scopedProgramId }
          : {},
      )
      .select("DATE_FORMAT(enrollment.created_at, '%Y-%m')", 'month')
      .addSelect('COUNT(DISTINCT user.id)', 'count')
      .groupBy("DATE_FORMAT(enrollment.created_at, '%Y-%m')")
      .orderBy("DATE_FORMAT(enrollment.created_at, '%Y-%m')", 'ASC')
      .getRawMany<{ month: string; count: string }>();

    const newStudentsMap = new Map(
      newStudentsRows.map((row) => [row.month, Number(row.count)]),
    );

    const activeStudentsMap = new Map(
      activeStudentsRows.map((row) => [row.month, Number(row.count)]),
    );

    const activeStudentsSeries: number[] = [];
    const totalStudentsSeries: number[] = [];

    let cumulativeStudents = 0;

    for (const month of months) {
      cumulativeStudents += newStudentsMap.get(month) ?? 0;
      totalStudentsSeries.push(cumulativeStudents);
      activeStudentsSeries.push(activeStudentsMap.get(month) ?? 0);
    }

    return {
      categories: months,
      series: [
        {
          name: 'Active Students',
          data: activeStudentsSeries,
        },
        {
          name: 'Students',
          data: totalStudentsSeries,
        },
      ],
    };
  }
  async getCertificatesIssuedTrend(
    programId?: number,
    currentUserInstituteId?: number,
    role?: string,
  ) {
    const isInstituteAdmin =
      role === 'INST_ADMIN' || role === 'INSTITUTE_ADMIN';

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : undefined;

    const scopedProgramId = isInstituteAdmin ? programId : undefined;

    const now = new Date();
    const months: string[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1,
      0,
      0,
      0,
      0,
    );

    const qb = this.certificateRepo
      .createQueryBuilder('certificate')
      .innerJoin('certificate.user', 'user')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.program', 'program')
      .where('certificate.issueDate >= :startDate', { startDate });

    if (scopedInstituteId !== undefined && scopedInstituteId !== null) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    if (scopedProgramId !== undefined && scopedProgramId !== null) {
      qb.andWhere('program.id = :programId', {
        programId: scopedProgramId,
      });
    }

    const rows = await qb
      .select("DATE_FORMAT(certificate.issueDate, '%Y-%m')", 'month')
      .addSelect('COUNT(certificate.id)', 'count')
      .groupBy("DATE_FORMAT(certificate.issueDate, '%Y-%m')")
      .orderBy("DATE_FORMAT(certificate.issueDate, '%Y-%m')", 'ASC')
      .getRawMany<{ month: string; count: string }>();

    const monthMap = new Map(rows.map((row) => [row.month, Number(row.count)]));

    return {
      categories: months,
      series: [
        {
          name: 'Certificates',
          data: months.map((month) => monthMap.get(month) ?? 0),
        },
      ],
    };
  }
  async getPackagesCompletedTrend(
    programId?: number,
    currentUserInstituteId?: number,
    role?: string,
  ) {
    const isInstituteAdmin =
      role === 'INST_ADMIN' || role === 'INSTITUTE_ADMIN';

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : undefined;

    const scopedProgramId = isInstituteAdmin ? programId : undefined;

    const now = new Date();
    const months: string[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1,
      0,
      0,
      0,
      0,
    );

    const qb = this.packageEnrollmentRepo
      .createQueryBuilder('packageEnrollment')
      .innerJoin('packageEnrollment.user', 'user')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.program', 'program')
      .where('packageEnrollment.status = :completedStatus', {
        completedStatus: 1,
      })
      .andWhere('packageEnrollment.completed_at IS NOT NULL')
      .andWhere('packageEnrollment.completed_at >= :startDate', { startDate });

    if (scopedInstituteId !== undefined && scopedInstituteId !== null) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    if (scopedProgramId !== undefined && scopedProgramId !== null) {
      qb.andWhere('program.id = :programId', {
        programId: scopedProgramId,
      });
    }

    const rows = await qb
      .select("DATE_FORMAT(packageEnrollment.completed_at, '%Y-%m')", 'month')
      .addSelect('COUNT(packageEnrollment.id)', 'count')
      .groupBy("DATE_FORMAT(packageEnrollment.completed_at, '%Y-%m')")
      .orderBy("DATE_FORMAT(packageEnrollment.completed_at, '%Y-%m')", 'ASC')
      .getRawMany<{ month: string; count: string }>();

    const monthMap = new Map(rows.map((row) => [row.month, Number(row.count)]));

    return months.map((month) => ({
      month,
      count: monthMap.get(month) ?? 0,
    }));
  }
  async getInstituteOverview(instituteId: number) {
    const [
      programsRaw,
      studentsRaw,
      nonStudentsRaw,
      coursesRaw,
      contentsRaw,
      certifiedStudentsRaw,
      completedStudentsRaw,
    ] = await Promise.all([
      this.ipcRepo
        .createQueryBuilder('ipc')
        .innerJoin('ipc.institute', 'institute')
        .innerJoin('ipc.program', 'program')
        .where('institute.id = :instituteId', { instituteId })
        .andWhere('ipc.is_active = :active', { active: 1 })
        .select('COUNT(DISTINCT program.id)', 'count')
        .getRawOne<CountRow>(),

      this.buildInstituteUsersQuery(instituteId)
        .andWhere('role.role_title = :studentRole', { studentRole: 'STUDENT' })
        .select('COUNT(DISTINCT user.id)', 'count')
        .getRawOne<CountRow>(),

      this.buildInstituteUsersQuery(instituteId)
        .andWhere('role.role_title <> :studentRole', { studentRole: 'STUDENT' })
        .select('COUNT(DISTINCT user.id)', 'count')
        .getRawOne<CountRow>(),

      this.ipcRepo
        .createQueryBuilder('ipc')
        .innerJoin('ipc.institute', 'institute')
        .innerJoin('ipc.course', 'course')
        .where('institute.id = :instituteId', { instituteId })
        .andWhere('ipc.is_active = :active', { active: 1 })
        .select('COUNT(DISTINCT course.id)', 'count')
        .getRawOne<CountRow>(),

      this.contentRepo
        .createQueryBuilder('content')
        .innerJoin(
          'content.courseContents',
          'courseContent',
          'courseContent.is_active = :active',
          { active: 1 },
        )
        .innerJoin('courseContent.course', 'course')
        .innerJoin(
          'course.instituteProgramCourses',
          'ipc',
          'ipc.is_active = :active AND ipc.institute.id = :instituteId',
          { active: 1, instituteId },
        )
        .andWhere('content.is_active = :contentActive', { contentActive: 1 })
        .select('COUNT(DISTINCT content.id)', 'count')
        .getRawOne<CountRow>(),

      this.certificateRepo
        .createQueryBuilder('certificate')
        .innerJoin('certificate.user', 'user')
        .innerJoin('user.institute', 'institute')
        .innerJoin('user.UserRole', 'role')
        .where('institute.id = :instituteId', { instituteId })
        .andWhere('role.role_title = :studentRole', { studentRole: 'STUDENT' })
        .select('COUNT(DISTINCT user.id)', 'count')
        .getRawOne<CountRow>(),

      this.enrollRepo
        .createQueryBuilder('enrollment')
        .innerJoin('enrollment.user', 'user')
        .innerJoin('user.institute', 'institute')
        .innerJoin('user.UserRole', 'role')
        .where('institute.id = :instituteId', { instituteId })
        .andWhere('role.role_title = :studentRole', { studentRole: 'STUDENT' })
        .andWhere('enrollment.status = :completed', { completed: 1 })
        .select('COUNT(DISTINCT user.id)', 'count')
        .getRawOne<CountRow>(),
    ]);

    return {
      programsCount: Number(programsRaw?.count ?? 0),
      studentsCount: Number(studentsRaw?.count ?? 0),
      nonStudentsCount: Number(nonStudentsRaw?.count ?? 0),
      coursesCount: Number(coursesRaw?.count ?? 0),
      contentsCount: Number(contentsRaw?.count ?? 0),
      certifiedStudentsCount: Number(certifiedStudentsRaw?.count ?? 0),
      completedStudentsCount: Number(completedStudentsRaw?.count ?? 0),
    };
  }
  async getStudentCertificates(userId: number): Promise<{
    count: number;
    items: Array<{
      certificateId: number;
      serialNumber: string;
      type: 'CONTENT' | 'PACKAGE';
      language: string;
      title: string;
      userCertificateName: string | null;
      issueDate: Date;
      hours: number | null;
      createdAt: Date;
    }>;
  }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const certificates = await this.certificateRepo.find({
      where: { user: { id: userId } },
      select: [
        'id',
        'serialNumber',
        'type',
        'language',
        'title',
        'userCertificateName',
        'issueDate',
        'hours',
        'createdAt',
      ],
      order: {
        issueDate: 'DESC',
        createdAt: 'DESC',
      },
    });

    return {
      count: certificates.length,
      items: certificates.map((certificate) => ({
        certificateId: certificate.id,
        serialNumber: certificate.serialNumber,
        type:
          certificate.type === CertificateType.PACKAGE ? 'PACKAGE' : 'CONTENT',
        language: certificate.language,
        title: certificate.title,
        userCertificateName: certificate.userCertificateName ?? null,
        issueDate: certificate.issueDate,
        hours: certificate.hours ?? null,
        createdAt: certificate.createdAt,
      })),
    };
  }
  async getTotalInstitutes() {
    const totalInstitutes = await this.instituteRepo
      .createQueryBuilder('institute')
      .where('institute.deletedAt IS NULL')
      .getCount();

    return {
      totalInstitutes,
    };
  }

  async getActiveStudents(currentUserInstituteId?: number, role?: string) {
    const isInstituteAdmin =
      role === 'INST_ADMIN' || role === 'INSTITUTE_ADMIN';

    const qb = this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.UserRole', 'role')
      .leftJoin('user.institute', 'institute')
      .where('user.deletedAt IS NULL')
      .andWhere('user.is_active = :active', { active: 1 })
      .andWhere('LOWER(role.role_title) = :roleTitle', {
        roleTitle: 'student',
      });

    if (isInstituteAdmin && currentUserInstituteId) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: currentUserInstituteId,
      });
    }

    const activeStudents = await qb.getCount();

    return {
      activeStudents,
    };
  }
  async getAiContentsCount() {
    const aiContentsCount = await this.contentRepo
      .createQueryBuilder('content')
      .where('content.deleted_at IS NULL')
      .andWhere('content.is_ai_content = :isAiContent', { isAiContent: 1 })
      .getCount();

    return {
      aiContentsCount,
    };
  }
  async institutesExpiringWithinMonth() {
    const institutesExpiringWithinMonth = await this.instituteRepo
      .createQueryBuilder('institute')
      .where('institute.deletedAt IS NULL')
      .andWhere('institute.expiredate IS NOT NULL')
      .andWhere(
        'institute.expiredate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 MONTH)',
      )
      .getCount();

    return {
      institutesExpiringWithinMonth,
    };
  }
  async getStudentsWithoutCourseAfterThreeMonths(
    currentUserInstituteId?: number,
    role?: string,
    selectedInstituteId?: number,
  ) {
    const isInstituteAdmin = this.isInstituteAdminRole(role);

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : selectedInstituteId;

    const buildStudentsQb = () => {
      const qb = this.userRepo
        .createQueryBuilder('user')
        .innerJoin('user.UserRole', 'role')
        .leftJoin('user.institute', 'institute')
        .where('user.deletedAt IS NULL')
        .andWhere('user.is_active = :active', { active: 1 })
        .andWhere('LOWER(role.role_title) = :studentRole', {
          studentRole: 'student',
        });

      if (scopedInstituteId !== undefined && scopedInstituteId !== null) {
        qb.andWhere('institute.id = :instituteId', {
          instituteId: scopedInstituteId,
        });
      }

      return qb;
    };

    const totalStudents = await buildStudentsQb()
      .select('COUNT(DISTINCT user.id)', 'count')
      .getRawOne<CountRow>()
      .then((row) => Number(row?.count ?? 0));

    const eligibleStudentsAfterThreeMonths = await buildStudentsQb()
      .andWhere('user.createdAt <= DATE_SUB(NOW(), INTERVAL 3 MONTH)')
      .select('COUNT(DISTINCT user.id)', 'count')
      .getRawOne<CountRow>()
      .then((row) => Number(row?.count ?? 0));

    const studentsWithoutCourseAfterThreeMonths = await buildStudentsQb()
      .andWhere('user.createdAt <= DATE_SUB(NOW(), INTERVAL 3 MONTH)')
      .andWhere(
        `NOT EXISTS (
        SELECT 1
        FROM enrollment enrollment_check
        WHERE enrollment_check.userId = user.id
      )`,
      )
      .select('COUNT(DISTINCT user.id)', 'count')
      .getRawOne<CountRow>()
      .then((row) => Number(row?.count ?? 0));

    const percentage =
      totalStudents > 0
        ? Number(
            (
              (studentsWithoutCourseAfterThreeMonths / totalStudents) *
              100
            ).toFixed(2),
          )
        : 0;

    return {
      instituteId: scopedInstituteId ?? null,
      totalStudents,
      eligibleStudentsAfterThreeMonths,
      studentsWithoutCourseAfterThreeMonths,
      percentage,
    };
  }
  async getInstitutesWithHighNoCourseStudents(thresholdPercentage = 70) {
    const rows = await this.instituteRepo
      .createQueryBuilder('institute')
      .innerJoin(
        'institute.users',
        'user',
        'user.deletedAt IS NULL AND user.is_active = 1',
      )
      .innerJoin(
        'user.UserRole',
        'role',
        'LOWER(role.role_title) = :studentRole',
        { studentRole: 'student' },
      )
      .where('institute.deletedAt IS NULL')
      .select('institute.id', 'instituteId')
      .addSelect('COUNT(DISTINCT user.id)', 'totalStudents')
      .addSelect(
        `
      COUNT(DISTINCT CASE
        WHEN user.createdAt <= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        AND NOT EXISTS (
          SELECT 1
          FROM enrollment enrollment_check
          WHERE enrollment_check.userId = user.id
        )
        THEN user.id
      END)
      `,
        'studentsWithoutCourseAfterThreeMonths',
      )
      .groupBy('institute.id')
      .getRawMany<{
        instituteId: string;
        totalStudents: string;
        studentsWithoutCourseAfterThreeMonths: string;
      }>();

    const institutes = rows
      .map((row) => {
        const totalStudents = Number(row.totalStudents ?? 0);
        const studentsWithoutCourseAfterThreeMonths = Number(
          row.studentsWithoutCourseAfterThreeMonths ?? 0,
        );

        const percentage =
          totalStudents > 0
            ? Number(
                (
                  (studentsWithoutCourseAfterThreeMonths / totalStudents) *
                  100
                ).toFixed(2),
              )
            : 0;

        return {
          instituteId: Number(row.instituteId),
          totalStudents,
          studentsWithoutCourseAfterThreeMonths,
          percentage,
        };
      })
      .filter((item) => item.totalStudents > 0)
      .filter((item) => item.percentage >= thresholdPercentage);

    return {
      thresholdPercentage,
      institutesCount: institutes.length,
      institutes,
    };
  }
  async getTopContentCategoriesEnrollments(
    currentUserInstituteId?: number,
    role?: string,
    languageId?: number,
    limit = 5,
    selectedInstituteId?: number,
  ) {
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);

    const isInstituteAdmin = this.isInstituteAdminRole(role);

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : selectedInstituteId;

    const qb = this.contentCategoryRepo
      .createQueryBuilder('category')
      .innerJoin(
        'content',
        'content',
        `
        content.contentCategoryId = category.id
        AND content.deleted_at IS NULL
        AND content.is_active = 1
      `,
      )
      .innerJoin(
        'enrollment',
        'enrollment',
        'enrollment.contentId = content.id',
      )
      .innerJoin(
        '`user`',
        'student',
        `
        student.id = enrollment.userId
        AND student.deletedAt IS NULL
        AND student.is_active = 1
      `,
      )
      .innerJoin(
        'system_role',
        'role',
        `
        role.id = student.UserRoleId
        AND TRIM(UPPER(role.role_title)) = :studentRole
      `,
        { studentRole: 'STUDENT' },
      )
      .where('category.deletedAt IS NULL')
      .andWhere('category.is_active = :active', { active: 1 });

    if (scopedInstituteId && Number(scopedInstituteId) > 0) {
      qb.andWhere('student.institute_id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    const rows = await qb
      .select('category.id', 'categoryId')
      .addSelect('COUNT(DISTINCT student.id)', 'studentsCount')
      .addSelect('COUNT(DISTINCT enrollment.id)', 'enrollmentsCount')
      .addSelect('COUNT(DISTINCT content.id)', 'contentsCount')
      .groupBy('category.id')
      .orderBy('COUNT(DISTINCT student.id)', 'DESC')
      .limit(safeLimit)
      .getRawMany<{
        categoryId: string;
        studentsCount: string;
        enrollmentsCount: string;
        contentsCount: string;
      }>();

    const categoryIds = rows.map((row) => Number(row.categoryId));

    if (!categoryIds.length) {
      return {
        debug: {
          currentUserInstituteId,
          role,
          isInstituteAdmin,
          selectedInstituteId,
          scopedInstituteId,
          safeLimit,
          note: 'No rows returned from direct table joins',
        },
        categories: [],
      };
    }

    const categories = await this.contentCategoryRepo.find({
      where: {
        id: In(categoryIds),
      },
      relations: ['translations', 'translations.language'],
    });

    const categoryNameMap = new Map<number, string>();

    for (const category of categories) {
      const selectedTranslation =
        category.translations?.find(
          (translation) => translation.language?.id === languageId,
        ) || category.translations?.[0];

      categoryNameMap.set(
        category.id,
        selectedTranslation?.name || `Category #${category.id}`,
      );
    }

    return {
      categories: rows.map((row) => ({
        categoryId: Number(row.categoryId),
        categoryName: categoryNameMap.get(Number(row.categoryId)) || null,
        studentsCount: Number(row.studentsCount ?? 0),
        enrollmentsCount: Number(row.enrollmentsCount ?? 0),
        contentsCount: Number(row.contentsCount ?? 0),
      })),
    };
  }
  async getEnrollmentActivityTrend(
    currentUserInstituteId?: number,
    role?: string,
    year?: number,
    selectedInstituteId?: number,
  ) {
    const selectedYear = year ?? new Date().getFullYear();

    const isInstituteAdmin = this.isInstituteAdminRole(role);

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : selectedInstituteId;

    const monthLabels = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const qb = this.enrollRepo
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.user', 'user')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.UserRole', 'role')
      .where('YEAR(enrollment.created_at) = :year', { year: selectedYear })
      .andWhere('user.deletedAt IS NULL')
      .andWhere('LOWER(role.role_title) = :studentRole', {
        studentRole: 'student',
      });

    if (scopedInstituteId) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    const rows = await qb
      .select('MONTH(enrollment.created_at)', 'monthNumber')
      .addSelect('COUNT(enrollment.id)', 'enrollmentsCount')
      .groupBy('MONTH(enrollment.created_at)')
      .orderBy('MONTH(enrollment.created_at)', 'ASC')
      .getRawMany<{
        monthNumber: string;
        enrollmentsCount: string;
      }>();

    const rowsMap = new Map(
      rows.map((row) => [
        Number(row.monthNumber),
        Number(row.enrollmentsCount ?? 0),
      ]),
    );

    const months = monthLabels.map((month, index) => {
      const monthNumber = index + 1;

      return {
        month,
        monthNumber,
        enrollmentsCount: rowsMap.get(monthNumber) ?? 0,
      };
    });

    return {
      year: selectedYear,
      instituteId: scopedInstituteId ?? null,
      months,
    };
  }
  async getProgramCourseCompletion(
    currentUserInstituteId?: number,
    role?: string,
    languageId?: number,
    limit = 5,
    selectedInstituteId?: number,
  ) {
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);

    const isInstituteAdmin = this.isInstituteAdminRole(role);

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : selectedInstituteId;

    const qb = this.enrollRepo
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.content', 'content')
      .innerJoin(
        'content.courseContents',
        'courseContent',
        'courseContent.deleted_at IS NULL AND courseContent.is_active = 1',
      )
      .innerJoin(
        'courseContent.course',
        'course',
        'course.deletedAt IS NULL AND course.isActive = 1',
      )
      .innerJoin(
        'course.programCourses',
        'programCourse',
        'programCourse.deleted_at IS NULL AND programCourse.isActive = 1',
      )
      .innerJoin(
        'programCourse.program',
        'program',
        'program.deletedAt IS NULL AND program.isActive = 1',
      )
      .innerJoin('enrollment.user', 'user', 'user.deletedAt IS NULL')
      .innerJoin(
        'user.UserRole',
        'userRole',
        'LOWER(userRole.role_title) = :studentRole',
        { studentRole: 'student' },
      )
      .leftJoin('user.institute', 'institute')
      .where('content.deleted_at IS NULL')
      .andWhere('content.is_active = :active', { active: 1 });

    if (scopedInstituteId) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    const rows = await qb
      .select('program.id', 'programId')
      .addSelect('course.id', 'courseId')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN enrollment.status = 1 THEN user.id END)',
        'completedStudentsCount',
      )
      .addSelect('COUNT(DISTINCT user.id)', 'totalStudentsCount')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN enrollment.status = 1 THEN enrollment.id END)',
        'completedEnrollmentsCount',
      )
      .addSelect('COUNT(DISTINCT enrollment.id)', 'totalEnrollmentsCount')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN enrollment.status = 1 THEN content.id END)',
        'completedContentsCount',
      )
      .groupBy('program.id')
      .addGroupBy('course.id')
      .getRawMany<{
        programId: string;
        courseId: string;
        completedStudentsCount: string;
        totalStudentsCount: string;
        completedEnrollmentsCount: string;
        totalEnrollmentsCount: string;
        completedContentsCount: string;
      }>();

    const programIds = [...new Set(rows.map((row) => Number(row.programId)))];
    const courseIds = [...new Set(rows.map((row) => Number(row.courseId)))];

    if (!programIds.length || !courseIds.length) {
      return {
        instituteId: scopedInstituteId ?? null,
        limitPerProgram: safeLimit,
        programs: [],
      };
    }

    const [programs, courses] = await Promise.all([
      this.programRepo.find({
        where: { id: In(programIds) },
        relations: ['translations', 'translations.language'],
      }),
      this.courseRepo.find({
        where: { id: In(courseIds) },
        relations: ['translations', 'translations.language'],
      }),
    ]);

    const programNameMap = new Map(
      programs.map((program) => [
        program.id,
        this.pickTranslationName(program.translations, languageId),
      ]),
    );

    const courseNameMap = new Map(
      courses.map((course) => [
        course.id,
        this.pickTranslationName(course.translations, languageId),
      ]),
    );

    const grouped = new Map<
      number,
      {
        programId: number;
        programName: string | null;
        courses: {
          courseId: number;
          courseName: string | null;
          completionPercentage: number;
          completedStudentsCount: number;
          totalStudentsCount: number;
          completedEnrollmentsCount: number;
          totalEnrollmentsCount: number;
          completedContentsCount: number;
        }[];
      }
    >();

    for (const row of rows) {
      const programId = Number(row.programId);
      const courseId = Number(row.courseId);

      const completedEnrollmentsCount = Number(
        row.completedEnrollmentsCount ?? 0,
      );
      const totalEnrollmentsCount = Number(row.totalEnrollmentsCount ?? 0);

      const completionPercentage =
        totalEnrollmentsCount > 0
          ? Number(
              (
                (completedEnrollmentsCount / totalEnrollmentsCount) *
                100
              ).toFixed(2),
            )
          : 0;

      if (!grouped.has(programId)) {
        grouped.set(programId, {
          programId,
          programName: programNameMap.get(programId) ?? null,
          courses: [],
        });
      }

      grouped.get(programId)!.courses.push({
        courseId,
        courseName: courseNameMap.get(courseId) ?? null,
        completionPercentage,
        completedStudentsCount: Number(row.completedStudentsCount ?? 0),
        totalStudentsCount: Number(row.totalStudentsCount ?? 0),
        completedEnrollmentsCount,
        totalEnrollmentsCount,
        completedContentsCount: Number(row.completedContentsCount ?? 0),
      });
    }

    const programsResult = Array.from(grouped.values()).map((program) => ({
      ...program,
      courses: program.courses
        .sort((a, b) => {
          if (b.completionPercentage !== a.completionPercentage) {
            return b.completionPercentage - a.completionPercentage;
          }

          return b.completedEnrollmentsCount - a.completedEnrollmentsCount;
        })
        .slice(0, safeLimit),
    }));

    return {
      instituteId: scopedInstituteId ?? null,
      limitPerProgram: safeLimit,
      programs: programsResult,
    };
  }
  async getTopContentCompletion(
    currentUserInstituteId?: number,
    role?: string,
    languageId?: number,
    limit = 10,
    selectedInstituteId?: number,
  ) {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const isInstituteAdmin = this.isInstituteAdminRole(role);

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : selectedInstituteId;

    const qb = this.contentRepo
      .createQueryBuilder('content')
      .innerJoin('content.enrollments', 'enrollment')
      .innerJoin('enrollment.user', 'user', 'user.deletedAt IS NULL')
      .innerJoin(
        'user.UserRole',
        'userRole',
        'LOWER(userRole.role_title) = :studentRole',
        { studentRole: 'student' },
      )
      .leftJoin('user.institute', 'institute')
      .where('content.deleted_at IS NULL')
      .andWhere('content.is_active = :active', { active: 1 });

    if (scopedInstituteId) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    const rows = await qb
      .select('content.id', 'contentId')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN enrollment.status = 1 THEN user.id END)',
        'completedStudentsCount',
      )
      .addSelect('COUNT(DISTINCT user.id)', 'totalStudentsCount')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN enrollment.status = 1 THEN enrollment.id END)',
        'completedEnrollmentsCount',
      )
      .addSelect('COUNT(DISTINCT enrollment.id)', 'totalEnrollmentsCount')
      .groupBy('content.id')
      .getRawMany<{
        contentId: string;
        completedStudentsCount: string;
        totalStudentsCount: string;
        completedEnrollmentsCount: string;
        totalEnrollmentsCount: string;
      }>();

    const rowsWithPercentage = rows
      .map((row) => {
        const completedEnrollmentsCount = Number(
          row.completedEnrollmentsCount ?? 0,
        );
        const totalEnrollmentsCount = Number(row.totalEnrollmentsCount ?? 0);

        const completionPercentage =
          totalEnrollmentsCount > 0
            ? Number(
                (
                  (completedEnrollmentsCount / totalEnrollmentsCount) *
                  100
                ).toFixed(2),
              )
            : 0;

        return {
          ...row,
          completionPercentage,
          completedStudentsCount: Number(row.completedStudentsCount ?? 0),
          totalStudentsCount: Number(row.totalStudentsCount ?? 0),
          completedEnrollmentsCount,
          totalEnrollmentsCount,
        };
      })
      .sort((a, b) => {
        if (b.completionPercentage !== a.completionPercentage) {
          return b.completionPercentage - a.completionPercentage;
        }

        return b.completedEnrollmentsCount - a.completedEnrollmentsCount;
      })
      .slice(0, safeLimit);

    const contentIds = rowsWithPercentage.map((row) => Number(row.contentId));

    if (!contentIds.length) {
      return {
        instituteId: scopedInstituteId ?? null,
        limit: safeLimit,
        contents: [],
      };
    }

    const contents = await this.contentRepo.find({
      where: { id: In(contentIds) },
      relations: ['translations', 'translations.language'],
    });

    const contentNameMap = new Map(
      contents.map((content) => [
        content.id,
        this.pickTranslationName(content.translations, languageId),
      ]),
    );

    return {
      instituteId: scopedInstituteId ?? null,
      limit: safeLimit,
      contents: rowsWithPercentage.map((row) => {
        const contentId = Number(row.contentId);

        return {
          contentId,
          contentName: contentNameMap.get(contentId) ?? null,
          completionPercentage: row.completionPercentage,
          completedStudentsCount: row.completedStudentsCount,
          totalStudentsCount: row.totalStudentsCount,
          completedEnrollmentsCount: row.completedEnrollmentsCount,
          totalEnrollmentsCount: row.totalEnrollmentsCount,
        };
      }),
    };
  }
  async getTopFacultyMembersEngagement(
    currentUserInstituteId?: number,
    role?: string,
    selectedInstituteId?: number,
  ) {
    const isInstituteAdmin = this.isInstituteAdminRole(role);

    const scopedInstituteId = isInstituteAdmin
      ? currentUserInstituteId
      : selectedInstituteId;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.UserRole', 'staffRole')
      .leftJoin('user.institute', 'institute')
      .leftJoin('user.enrollments', 'enrollment')
      .where('user.deletedAt IS NULL')
      .andWhere('user.is_active = :active', { active: 1 })
      .andWhere('staffRole.role_category = :staffCategory', {
        staffCategory: 0,
      })
      .andWhere('LOWER(staffRole.role_title) NOT IN (:...excludedRoles)', {
        excludedRoles: ['student'],
      });

    if (scopedInstituteId) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: scopedInstituteId,
      });
    }

    const rows = await qb
      .select('staffRole.role_title', 'roleTitle')
      .addSelect('COUNT(DISTINCT user.id)', 'totalStaff')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN enrollment.id IS NOT NULL THEN user.id END)',
        'enrolledStaffCount',
      )
      .groupBy('staffRole.id')
      .addGroupBy('staffRole.role_title')
      .getRawMany<{
        roleTitle: string;
        totalStaff: string;
        enrolledStaffCount: string;
      }>();

    const roles = rows.map((row) => {
      const totalStaff = Number(row.totalStaff ?? 0);
      const enrolledStaffCount = Number(row.enrolledStaffCount ?? 0);
      const notEnrolledStaffCount = totalStaff - enrolledStaffCount;

      const engagementPercentage =
        totalStaff > 0
          ? Number(((enrolledStaffCount / totalStaff) * 100).toFixed(2))
          : 0;

      return {
        roleTitle: row.roleTitle,
        totalStaff,
        enrolledStaffCount,
        notEnrolledStaffCount,
        engagementPercentage,
      };
    });

    const totalStaff = roles.reduce((sum, item) => sum + item.totalStaff, 0);

    const enrolledStaffCount = roles.reduce(
      (sum, item) => sum + item.enrolledStaffCount,
      0,
    );

    const notEnrolledStaffCount = totalStaff - enrolledStaffCount;

    const engagementPercentage =
      totalStaff > 0
        ? Number(((enrolledStaffCount / totalStaff) * 100).toFixed(2))
        : 0;

    return {
      instituteId: scopedInstituteId ?? null,
      totalStaff,
      enrolledStaffCount,
      notEnrolledStaffCount,
      engagementPercentage,
      roles: roles.sort(
        (a, b) => b.engagementPercentage - a.engagementPercentage,
      ),
    };
  }
}
