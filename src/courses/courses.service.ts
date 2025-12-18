import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseTranslation } from './entities/course-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Program } from 'src/programs/entities/program.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { ProgramCourse } from 'src/programs/entities/program-course.entity';
import { InstitutePrograms } from 'src/institutes/entities/institute-programs.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { SavedCourse } from 'src/saved-courses/entities/saved-course.entity';
interface courseRow {
  course_id: number;
  course_image: string;
  course_isActive: number;
  translation_name: string;
  translation_description: string;
  translation_whatToLearn: string[];
}
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,

    @InjectRepository(CourseTranslation)
    private readonly courseTranslationRepository: Repository<CourseTranslation>,

    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,

    @InjectRepository(ProgramCourse)
    private readonly programCourseRepository: Repository<ProgramCourse>,

    @InjectRepository(InstitutePrograms)
    private readonly ipRepository: Repository<InstitutePrograms>,

    @InjectRepository(InstituteProgramCourse)
    private readonly ipcRepository: Repository<InstituteProgramCourse>,

    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,

    @InjectRepository(SavedCourse)
    private readonly savedCourse: Repository<SavedCourse>,
  ) {}

  /** 1) إنشاء كورس عام بدون أي ربط */
  async create(dto: CreateCourseDto, image?: Express.Multer.File) {
    const baseUrl = process.env.APP_URL || '';
    const imagePath = image
      ? `${baseUrl}/uploads/course-images/${image.filename}`
      : '';
    const course = this.courseRepository.create({
      image: imagePath,
      notes: dto.notes,
      isActive: 1,
    });
    const savedCourse = await this.courseRepository.save(course);

    const translations = await Promise.all(
      dto.translations.map(async (t) => {
        const lang = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!lang)
          throw new NotFoundException(`Language ${t.languageId} not found`);
        const tr = this.courseTranslationRepository.create({
          name: t.name,
          description: t.description,
          whatToLearn: t.whatToLearn,
          course: savedCourse,
          language: lang,
        });
        return this.courseTranslationRepository.save(tr);
      }),
    );

    return { ...savedCourse, translations };
  }

  /** 2) ربط كورس ببرنامج عام (ProgramCourse = كتالوج البرنامج) */
  async assignCourseToProgram(programId: number, courseId: number) {
    const [program, course] = await Promise.all([
      this.programRepository.findOne({ where: { id: programId } }),
      this.courseRepository.findOne({ where: { id: courseId } }),
    ]);
    if (!program) throw new NotFoundException(`Program ${programId} not found`);
    if (!course) throw new NotFoundException(`Course ${courseId} not found`);

    const exist = await this.programCourseRepository.findOne({
      where: { program: { id: programId }, course: { id: courseId } },
      withDeleted: true,
    });

    if (exist && (exist as any).deleted_at) {
      // لو كان متشال soft قبل كده رجّعه
      await this.programCourseRepository.recover(exist as any);
      exist.is_active = 1;
      await this.programCourseRepository.save(exist);
    } else if (!exist) {
      await this.programCourseRepository.save(
        this.programCourseRepository.create({
          program: { id: programId },
          course: { id: courseId },
          is_active: 1,
        }),
      );
    } // لو موجود ومفعل خلاص

    return { message: `Course ${courseId} assigned to Program ${programId}.` };
  }
  // فك ربط كورس من برنامج عام (PC) - Soft Delete
  async removeCourseFromProgram(programId: number, courseId: number) {
    const link = await this.programCourseRepository.findOne({
      where: { program: { id: programId }, course: { id: courseId } },
      withDeleted: true,
    });

    if (!link) {
      throw new NotFoundException(
        `No ProgramCourse link found for program ${programId} with course ${courseId}`,
      );
    }

    if ((link as any).deleted_at) {
      return { message: 'Already unassigned (soft-deleted before).' };
    }

    await this.programCourseRepository.softDelete(link.id);
    return {
      message: `Course ${courseId} soft-unassigned from program ${programId}.`,
    };
  }

  // فك ربط كورس من برنامج تابع لمعهد (IPC) - Soft Delete
  async removeCourseFromInstituteProgram(
    instituteId: number,
    programId: number,
    courseId: number,
  ) {
    const link = await this.ipcRepository.findOne({
      where: {
        institute: { id: instituteId },
        program: { id: programId },
        course: { id: courseId },
      },
      withDeleted: true,
    });

    if (!link) {
      throw new NotFoundException(
        `No InstituteProgramCourse link for institute ${instituteId}, program ${programId}, course ${courseId}`,
      );
    }

    if ((link as any).deleted_at) {
      return { message: 'Already unassigned (soft-deleted before).' };
    }

    await this.ipcRepository.softDelete(link.id);
    return {
      message: `Course ${courseId} soft-unassigned from program ${programId} at institute ${instituteId}.`,
    };
  }

  /** helper: جلب الكورسات من كتالوج البرنامج (ProgramCourse) */
  async findByProgram(programId: number, languageId?: number) {
    const program = await this.programRepository.findOne({
      where: { id: programId },
      relations: [
        'programCourses',
        'programCourses.course',
        'programCourses.course.translations',
        'programCourses.course.translations.language',
      ],
    });
    if (!program) throw new NotFoundException(`Program ${programId} not found`);

    return (program.programCourses || [])
      .filter((pc) => (pc as any).is_active !== 0)
      .map((pc) => {
        const c = pc.course;
        const tr =
          c.translations.find((t) => t.language.id === languageId) ||
          c.translations[0];
        return {
          id: c.id,
          image: c.image,
          name: tr?.name ?? '',
          description: tr?.description ?? '',
        };
      });
  }

  /** 3) ربط كورس ببرنامج مربوط بمعهد (InstituteProgramCourse) */
  async assignCourseToInstituteProgram(
    instituteId: number,
    programId: number,
    courseId: number,
  ) {
    // تأكد الأول إن البرنامج مربوط بالمعهد (IP)
    const ip = await this.ipRepository.findOne({
      where: { institute: { id: instituteId }, program: { id: programId } },
    });
    if (!ip)
      throw new ForbiddenException(
        `Program ${programId} is not assigned to Institute ${instituteId}`,
      );

    // (اختياري لكن مُستحسن) تأكد إن الكورس موجود في كتالوج البرنامج (PC)
    const pc = await this.programCourseRepository.findOne({
      where: { program: { id: programId }, course: { id: courseId } },
    });
    if (!pc) {
      throw new BadRequestException(
        `Course ${courseId} is not part of Program ${programId} catalog`,
      );
    }

    // اربط/فعّل في IPC
    const existing = await this.ipcRepository.findOne({
      where: {
        institute: { id: instituteId },
        program: { id: programId },
        course: { id: courseId },
      },
      withDeleted: true,
    });

    if (existing && (existing as any).deleted_at) {
      await this.ipcRepository.recover(existing as any);
      existing.is_active = 1;
      await this.ipcRepository.save(existing);
    } else if (!existing) {
      await this.ipcRepository.save(
        this.ipcRepository.create({
          institute: { id: instituteId },
          program: { id: programId },
          course: { id: courseId },
          is_active: 1,
        }),
      );
    }

    return {
      message: `Course ${courseId} assigned to Program ${programId} for Institute ${instituteId}.`,
    };
  }

  // courses.service.ts
  async getCourseTreeForInstitute(
    instituteId: number,
    courseId: number,
    languageId?: number,
  ) {
    // تأكيد الوصول: لازم يبقى في لينك IPC للكورس ده في المعهد ده
    const link = await this.ipcRepository.findOne({
      where: {
        institute: { id: instituteId },
        course: { id: courseId },
        is_active: 1,
      },
      relations: [
        'course',
        // محتوى الكورس
        'course.courseContents',
        'course.courseContents.content',
        // ترجمات المحتوى
        'course.courseContents.content.translations',
        'course.courseContents.content.translations.language',
        // التوبيكس والدروس
        'course.courseContents.content.topics',
        'course.courseContents.content.topics.lessons',
      ],
    });

    if (!link) {
      throw new ForbiddenException('Course not accessible for this institute');
    }

    const c = link.course;

    // نحول الشجرة ل JSON مرتب
    const contents = (c.courseContents || []).map((cc) => {
      const content = cc.content;

      const ctr =
        content.translations?.find((t) => t.language.id === languageId) ||
        content.translations?.[0];

      return {
        id: content.id,
        name: ctr?.name || '',
        description: ctr?.description || '',
        topic: content.topics.map((t) => {
          const topicTranslation = t.translations?.[0] || null;
          return {
            id: t.id,
            name: topicTranslation?.name || '',
            lessons: t.lessons.map((l) => {
              const lessonTranslation = l.translations?.[0] || null;
              return {
                id: l.id,
                name: lessonTranslation?.name || '',
              };
            }),
          };
        }),
      };
    });

    return {
      id: c.id,
      image: c.image,
      notes: c.notes,
      contents,
    };
  }

  /** بقية الدوال القديمة (findAll / findOne / update / remove) تبقى كما هي تقريبًا */
  async findAll(languageId?: number) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')
      .select([
        'course.id AS course_id',
        'course.image AS course_image',
        'course.isActive',
        'translation.name AS translation_name',
        'translation.description AS translation_description',
        'translation.whatToLearn AS translation_whatToLearn',
      ]);
    const rows = await query.getRawMany<courseRow>();
    return rows.map((row) => ({
      id: row.course_id,
      image: row.course_image,
      isActive: row.course_isActive,
      name: row.translation_name,
      description: row.translation_description,
      whatToLearn: row.translation_whatToLearn ?? [],
    }));
  }
  async findOne(id: number, languageId?: number) {
    const query = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')
      .where('course.id = :id', { id })
      .select([
        'course.id AS course_id',
        'course.image AS course_image',
        'course.isActive',
        'translation.name AS translation_name',
        'translation.description AS translation_description',
        'translation.whatToLearn AS translation_whatToLearn',
      ]);
    const row = await query.getRawOne<courseRow>();
    if (!row) throw new NotFoundException(`Course ${id} not found`);
    return {
      id: row.course_id,
      image: row.course_image,
      isActive: row.course_isActive,
      name: row.translation_name,
      description: row.translation_description,
      whatToLearn: row.translation_whatToLearn ?? [],
    };
  }

  async findAllCoursesForInstitute(
    userInstituteId?: number,
    languageId?: number,
  ) {
    const links = await this.ipcRepository.find({
      where: { institute: { id: userInstituteId }, is_active: 1 },
      relations: [
        'course',
        'course.translations',
        'course.translations.language',
      ],
    });
    if (!links.length) return [];
    return links.map((l) => {
      const c = l.course;
      const tr =
        c.translations.find((t) => t.language.id === languageId) ||
        c.translations[0];
      return {
        id: c.id,
        image: c.image,
        name: tr?.name,
        description: tr?.description,
        whatToLearn: tr?.whatToLearn ?? [],
      };
    });
  }

  async findCourseForInstitute(
    id: number,
    userInstituteId?: number,
    languageId?: number,
  ) {
    const link = await this.ipcRepository.findOne({
      where: { institute: { id: userInstituteId }, course: { id } },
      relations: [
        'course',
        'course.translations',
        'course.translations.language',
        'program',
        'program.translations',
      ],
    });
    if (!link)
      throw new ForbiddenException('Not accessible for this institute');

    const c = link.course;
    const tr =
      c.translations.find((t) => t.language.id === languageId) ||
      c.translations[0];
    return {
      id: c.id,
      image: c.image,
      name: tr?.name,
      description: tr?.description,
      program: {
        id: link.program.id,
        name: link.program.translations?.[0]?.name ?? '',
      },
    };
  }

  async update(id: number, dto: UpdateCourseDto, image?: Express.Multer.File) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!course) throw new NotFoundException(`Course ${id} not found`);

    if (image) {
      const baseUrl = process.env.APP_URL || '';
      course.image = `${baseUrl}/uploads/course-images/${image.filename}`;
    }
    if (dto.notes) course.notes = dto.notes;

    if (dto.translations?.length) {
      for (const t of dto.translations) {
        const lang = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!lang)
          throw new NotFoundException(`Language ${t.languageId} not found`);

        const existing = course.translations.find(
          (tr) => tr.language.id === t.languageId,
        );

        if (existing) {
          existing.name = t.name;
          existing.description = t.description;
          existing.whatToLearn = t.whatToLearn || [];
          await this.courseTranslationRepository.save(existing);
        } else {
          const newTrans = this.courseTranslationRepository.create({
            name: t.name,
            description: t.description,
            whatToLearn: t.whatToLearn,
            course,
            language: lang,
          });
          await this.courseTranslationRepository.save(newTrans);
        }
      }
    }

    await this.courseRepository.save(course);
    return this.findOne(id);
  }

  async remove(id: number) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException(`Course ${id} not found`);
    await this.courseRepository.softDelete(id);
    return { message: `Course ${id} deleted successfully` };
  }
  // داخل CoursesService

  /** المقررات الخاصة بمعهد + برنامج (Paginated 8) */
  async findInstituteProgramCoursesPaginated(
    instituteId: number,
    programId: number,
    languageId?: number,
    page = 1,
    limit = 8,
  ) {
    const offset = (page - 1) * limit;

    // 1) IDs للكورسات المرتبطة بالـ Institute + Program
    const baseQb = this.ipcRepository
      .createQueryBuilder('ipc')
      .innerJoin('ipc.course', 'course')
      .where('ipc.is_active != 0')
      .andWhere('ipc.instituteId = :instituteId', { instituteId })
      .andWhere('ipc.programId = :programId', { programId })
      .select('course.id', 'id')
      .groupBy('course.id');

    const allRows = await baseQb.getRawMany<{ id: number }>();
    const total = allRows.length;

    const pageRows = await baseQb
      .limit(limit)
      .offset(offset)
      .getRawMany<{ id: number }>();
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

    const courseIds = pageRows.map((r) => Number(r.id));

    // 2️⃣ حساب عدد الـ contents و مجموع الـ durations (JOIN chain)
    const rows = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course_content',
        'cc',
        'cc.courseId = course.id AND cc.deleted_at IS NULL',
      )
      .leftJoin('content', 'c', 'c.id = cc.contentId AND c.deleted_at IS NULL')
      .leftJoin(
        'topic',
        't',
        't.contentId = c.id AND t.deleted_at IS NULL AND t.is_active != 0',
      )
      .leftJoin(
        'lesson',
        'l',
        'l.topicId = t.id AND l.deleted_at IS NULL AND l.is_active != 0',
      )
      .select('course.id', 'id')
      .addSelect('COUNT(DISTINCT c.id)', 'contentsCount')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .where('course.id IN (:...courseIds)', { courseIds })
      .groupBy('course.id')
      .getRawMany<{
        id: string;
        contentsCount: string;
        totalDuration: string;
      }>();

    const countMap = new Map<number, number>(
      rows.map((r) => [Number(r.id), Number(r.contentsCount)]),
    );
    const durationMap = new Map<number, number>(
      rows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );

    // 3️⃣ تفاصيل الكورسات + الترجمات
    const courses = await this.courseRepository.find({
      where: { id: In(courseIds) },
      relations: ['translations', 'translations.language', 'courseContents'],
    });

    const orderIndex = new Map<number, number>(
      courseIds.map((id, i) => [id, i]),
    );
    courses.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const items = courses.map((c) => {
      const tr =
        c.translations.find((t) => t.language?.id === languageId) ||
        c.translations[0];
      return {
        id: c.id,
        image: c.image,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        contentsCount: countMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0, // ⏱️ إجمالي الثواني
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

  /** أول 8 مقررات لمعهد + برنامج (Slider) */
  async findInstituteProgramCoursesFirstEight(
    instituteId: number,
    programId: number,
    languageId?: number,
  ) {
    // 1️⃣ أول 8 كورسات IDs
    const testRows = await this.ipcRepository
      .createQueryBuilder('ipc')
      .select(['ipc.id', 'ipc.is_active', 'ipc.instituteId', 'ipc.programId'])
      .getRawMany();

    console.log('IPC testRows:', testRows);
    const rows = await this.ipcRepository
      .createQueryBuilder('ipc')
      .innerJoin('ipc.course', 'course')
      .where('ipc.is_active != 0')
      .andWhere('ipc.instituteId = :instituteId', { instituteId })
      .andWhere('ipc.programId = :programId', { programId })
      .select('course.id', 'id')
      .groupBy('course.id')
      .limit(8)
      .getRawMany<{ id: number }>();

    if (!rows.length) return [];

    const courseIds = rows.map((r) => Number(r.id));

    // 2️⃣ احسب عدد الـ contents و مجموع الـ durations
    const durRows = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course_content',
        'cc',
        'cc.courseId = course.id AND cc.deleted_at IS NULL',
      )
      .leftJoin('content', 'c', 'c.id = cc.contentId AND c.deleted_at IS NULL')
      .leftJoin(
        'topic',
        't',
        't.contentId = c.id AND t.deleted_at IS NULL AND t.is_active != 0',
      )
      .leftJoin(
        'lesson',
        'l',
        'l.topicId = t.id AND l.deleted_at IS NULL AND l.is_active != 0',
      )
      .select('course.id', 'id')
      .addSelect('COUNT(DISTINCT c.id)', 'contentsCount')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .where('course.id IN (:...courseIds)', { courseIds })
      .groupBy('course.id')
      .getRawMany<{
        id: string;
        contentsCount: string;
        totalDuration: string;
      }>();

    const countMap = new Map<number, number>(
      durRows.map((r) => [Number(r.id), Number(r.contentsCount)]),
    );
    const durationMap = new Map<number, number>(
      durRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );

    // 3️⃣ هات الكورسات + الترجمات
    const courses = await this.courseRepository.find({
      where: { id: In(courseIds) },
      relations: ['translations', 'translations.language', 'courseContents'],
    });

    // نفس ترتيب IDs
    const orderIndex = new Map<number, number>(
      courseIds.map((id, i) => [id, i]),
    );
    courses.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    return courses.map((c) => {
      const tr =
        c.translations.find((t) => t.language?.id === languageId) ||
        c.translations[0];
      return {
        id: c.id,
        image: c.image,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        contentsCount: countMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0, // ⏱️ إجمالي الثواني الخام
      };
    });
  }

  // courses.service.ts
  async getCourseBasicById(
    courseId: number,
    {
      languageId,
      instituteId,
      programId,
    }: { languageId?: number; instituteId?: number; programId?: number } = {},
    userId?: number,
  ) {
    // الكورس + الترجمات
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['translations', 'translations.language'],
    });
    if (!course) throw new NotFoundException(`Course ${courseId} not found`);

    const tr =
      course.translations?.find((t) => t.language?.id === languageId) ||
      course.translations?.[0] ||
      null;

    // IDs للمحتويات التابعة للكورس (مع/بدون فلترة IPC)
    let contentIdRows: { id: number }[];
    if (!instituteId && !programId) {
      contentIdRows = await this.courseRepository
        .createQueryBuilder('course')
        .leftJoin(
          'course_content',
          'cc',
          'cc.courseId = course.id AND cc.deleted_at IS NULL AND cc.is_active != 0',
        )
        .leftJoin(
          'content',
          'c',
          'c.id = cc.contentId AND c.deleted_at IS NULL',
        )
        .where('course.id = :courseId', { courseId })
        .select('c.id', 'id')
        .groupBy('c.id')
        .getRawMany();
    } else {
      contentIdRows = await this.ipcRepository
        .createQueryBuilder('ipc')
        .innerJoin('ipc.course', 'course', 'course.id = :courseId', {
          courseId,
        })
        .innerJoin(
          'course_content',
          'cc',
          'cc.courseId = course.id AND cc.deleted_at IS NULL AND cc.is_active != 0',
        )
        .innerJoin(
          'content',
          'c',
          'c.id = cc.contentId AND c.deleted_at IS NULL',
        )
        .select('c.id', 'id')
        .groupBy('c.id')
        .andWhere('ipc.instituteId = :instituteId', { instituteId })
        .andWhere('ipc.programId = :programId', { programId })
        .getRawMany();
    }

    const contentsCount = contentIdRows.length;

    // إجمالي الديوراشن عبر كل المحتويات
    const durRow = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course_content',
        'cc',
        'cc.courseId = course.id AND cc.deleted_at IS NULL AND cc.is_active != 0',
      )
      .leftJoin('content', 'c', 'c.id = cc.contentId AND c.deleted_at IS NULL')
      .leftJoin(
        'topic',
        't',
        't.contentId = c.id AND t.deleted_at IS NULL AND t.is_active != 0',
      )
      .leftJoin(
        'lesson',
        'l',
        'l.topicId = t.id AND l.deleted_at IS NULL AND l.is_active != 0',
      )
      .select('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .where('course.id = :courseId', { courseId })
      .getRawOne<{ totalDuration: string }>();
    let isSaved = false;
    if (userId) {
      // لو TypeORM >= 0.3 يدعم getExists()
      const exists = await this.savedCourse
        .createQueryBuilder('s')
        .leftJoin('s.user', 'u')
        .leftJoin('s.content', 'c')
        .where('u.id = :uid', { uid: userId })
        .andWhere('c.id = :cid', { cid: course.id })
        .getExists(); // إن لم تتوفر، استخدم getCount()>0
      isSaved = exists;
    }
    return {
      id: course.id,
      image: course.image,
      name: tr?.name ?? '',
      description: tr?.description ?? '',
      notes: course.notes,
      contentsCount,
      totalDuration: Number(durRow?.totalDuration ?? 0),
      isSaved,
    };
  }
  async getCourseContentsPaginated(
    courseId: number,
    {
      page = 1,
      limit = 8,
      languageId,
      instituteId,
      programId,
      userId, // اختياري لإظهار isEnrolled + completedLessons
    }: {
      page?: number;
      limit?: number;
      languageId?: number;
      instituteId?: number;
      programId?: number;
      userId?: number;
    } = {},
  ) {
    const skip = (page - 1) * limit;

    // 1) IDs للمحتويات + إجمالي العدد (Typed)
    let baseQb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(
        'course_content',
        'cc',
        'cc.courseId = course.id AND cc.deleted_at IS NULL AND cc.is_active != 0',
      )
      .leftJoin('content', 'c', 'c.id = cc.contentId AND c.deleted_at IS NULL')
      .where('course.id = :courseId', { courseId })
      .select('c.id', 'id')
      .groupBy('c.id');

    if (instituteId || programId) {
      const qb = this.ipcRepository
        .createQueryBuilder('ipc')
        .innerJoin('ipc.course', 'course', 'course.id = :courseId', {
          courseId,
        })
        .innerJoin(
          'course_content',
          'cc',
          'cc.courseId = course.id AND cc.deleted_at IS NULL AND cc.is_active != 0',
        )
        .innerJoin(
          'content',
          'c',
          'c.id = cc.contentId AND c.deleted_at IS NULL',
        )
        .select('c.id', 'id')
        .groupBy('c.id');

      if (instituteId)
        qb.andWhere('ipc.instituteId = :instituteId', { instituteId });
      if (programId) qb.andWhere('ipc.programId = :programId', { programId });

      // نحافظ على نفس الواجهة
      baseQb = qb as unknown as typeof baseQb;
    }

    const allIdRows = await baseQb.getRawMany<{ id: number }>();
    const total = allIdRows.length;

    const pageIdRows = await baseQb
      .limit(limit)
      .offset(skip)
      .getRawMany<{ id: number }>();
    const contentIds = pageIdRows.map((r) => Number(r.id));

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

    // 2) تفاصيل المحتوى + ترجمات + كاتيجوري
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
      .where('c.id IN (:...ids)', { ids: contentIds })
      .getMany();

    // 3) إحصاءات: duration + ratersCount
    const statsRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't')
      .leftJoin('t.lessons', 'l')
      .leftJoin('c.enrollments', 'e')
      .select('c.id', 'id')
      .addSelect('COALESCE(SUM(l.duration), 0)', 'totalDuration')
      .addSelect('SUM(CASE WHEN e.rating > 0 THEN 1 ELSE 0 END)', 'ratersCount')
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: number; totalDuration: string; ratersCount: string }>();

    const durationMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.totalDuration)]),
    );
    const ratersMap = new Map<number, number>(
      statsRows.map((r) => [Number(r.id), Number(r.ratersCount)]),
    );

    // 3-bis) إجمالي عدد الدروس (active) لكل محتوى
    const lessonsCountRows = await this.contentRepo
      .createQueryBuilder('c')
      .leftJoin('c.topics', 't', 't.deleted_at IS NULL AND t.is_active != 0')
      .leftJoin('t.lessons', 'l', 'l.deleted_at IS NULL AND l.is_active != 0')
      .select('c.id', 'id')
      .addSelect('COUNT(DISTINCT l.id)', 'totalLessons')
      .where('c.id IN (:...ids)', { ids: contentIds })
      .groupBy('c.id')
      .getRawMany<{ id: number; totalLessons: string }>();

    const totalLessonsMap = new Map<number, number>(
      lessonsCountRows.map((r) => [Number(r.id), Number(r.totalLessons || 0)]),
    );

    // 3-ter) عدد الدروس المكتملة لكل محتوى لهذا المستخدم (لو userId موجود)
    let completedLessonsMap = new Map<number, number>();
    if (userId) {
      // الطريقة المضمونة: progress -> enrollment -> content
      const completedRows = await this.progressRepo
        .createQueryBuilder('lp')
        .innerJoin('lp.enrollment', 'en')
        .innerJoin('en.content', 'c')
        .where('lp.user_id = :uid', { uid: userId }) // اسم العمود الفعلي
        .andWhere('lp.deleted_at IS NULL')
        .andWhere('c.id IN (:...ids)', { ids: contentIds })
        .select('c.id', 'id')
        .addSelect('COUNT(DISTINCT lp.lesson_id)', 'completedLessons')
        .groupBy('c.id')
        .getRawMany<{ id: string; completedLessons: string }>();

      completedLessonsMap = new Map<number, number>(
        completedRows.map((r) => [
          Number(r.id),
          Number(r.completedLessons || 0),
        ]),
      );
    }

    // 4) isEnrolled (اختياري)
    let enrolledMap = new Map<number, boolean>();
    if (userId) {
      const enrRows = await this.enrollmentRepo
        .createQueryBuilder('en')
        .select(['en.contentId AS cid'])
        .where('en.userId = :uid', { uid: userId })
        .andWhere('en.contentId IN (:...ids)', { ids: contentIds })
        .getRawMany<{ cid: number }>();
      enrolledMap = new Map(enrRows.map((r) => [Number(r.cid), true]));
    }

    // 5) حافظ على ترتيب الـ IDs
    const orderIndex = new Map(contentIds.map((id, i) => [id, i]));
    contents.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    // 6) بناء العناصر
    const items = contents.map((c) => {
      const tr = this.pickTranslation<{
        language?: { id: number };
        name?: string;
        description?: string;
        what_to_learn?: string;
      }>(c.translations, languageId);

      const catTr = this.pickTranslation<{
        language?: { id: number };
        name?: string;
      }>(c.contentCategory?.translations, languageId);

      const totalLessons = totalLessonsMap.get(c.id) ?? 0;
      const completedLessons = userId
        ? (completedLessonsMap.get(c.id) ?? 0)
        : 0;

      const base = {
        id: c.id,
        name: tr?.name ?? '',
        description: tr?.description ?? '',
        image: c.image ?? null,
        level: c.level,
        rate: c.rate ?? 0,
        ratersCount: ratersMap.get(c.id) ?? 0,
        totalDuration: durationMap.get(c.id) ?? 0,
        whatToLearn: tr?.what_to_learn?.split(',') ?? [],
        category: {
          id: c.contentCategory?.id ?? null,
          name: catTr?.name ?? '',
        },
        created_at: c.created_at,

        // الجديد:
        totalLessons,
        completedLessons,
      };

      return userId
        ? { ...base, isEnrolled: enrolledMap.get(c.id) ?? false }
        : base;
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

  // 🧩 Helper صغير لنفس أسلوبك
  private pickTranslation<T extends { language?: { id?: number } }>(
    list: T[] | undefined,
    languageId?: number,
  ): T | undefined {
    if (!list || !list.length) return undefined;
    if (languageId == null) return list[0];
    return list.find((t) => (t as any)?.language?.id === languageId) ?? list[0];
  }
  async coursesNav(
    instituteId: number,
    programId: number,
    { languageId, limit = 12 }: { languageId?: number; limit?: number } = {},
  ): Promise<
    Array<{
      id: number;
      name: string;
      image: string | null;
    }>
  > {
    const rows = await this.ipcRepository
      .createQueryBuilder('ipc')
      .innerJoinAndSelect('ipc.course', 'course')
      .leftJoinAndSelect(
        'course.translations',
        'tr',
        languageId ? 'tr.languageId = :languageId' : undefined,
        { languageId },
      )
      .where('ipc.is_active != 0')
      .andWhere('ipc.instituteId = :instituteId', { instituteId })
      .andWhere('ipc.programId = :programId', { programId })
      .orderBy('ipc.id', 'DESC')
      .take(limit)
      .getMany(); // InstituteProgramCourse[]

    if (!rows.length) return [];

    return rows.map((link) => {
      const c = link.course;
      const tr = this.pickTranslation<{
        language?: { id?: number };
        name?: string;
        description?: string;
      }>(c.translations, languageId);

      return {
        id: c.id,
        name: tr?.name ?? '',
        image: c.image ?? null,
      };
    });
  }
  async toggleActive(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }
    const courseStatuse = (course.isActive = course.isActive ? 0 : 1);
    await this.courseRepository.save(course);
    return {
      message: `Course with ID ${courseId} is now ${
        courseStatuse ? 'active' : 'inactive'
      }.`,
      id: courseId,
      isActive: courseStatuse,
    };
  }
}
