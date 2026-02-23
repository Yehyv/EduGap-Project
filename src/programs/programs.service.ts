import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { Language } from 'src/languages/entities/language.entity';
import { ProgramTranslation } from './entities/program-translation.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { InstitutePrograms } from 'src/institutes/entities/institute-programs.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { ProgramCourse } from './entities/program-course.entity';
interface ProgramRaw {
  program_id: number;
  program_logo: string;
  program_createdAt: Date;
  translation_name: string;
  translation_description: string;
  language_id: number;
  isActive: number;
  course_id: number;
  course_name: string;
  courses_count: number;
  institute_id: number;
  institute_logo: string;
  institute_name: string;
  students_count: number;
  created_by_id: number;
  created_by_name: string;
}
@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,

    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,

    @InjectRepository(ProgramTranslation)
    private readonly programTranslationRepository: Repository<ProgramTranslation>,

    @InjectRepository(Institute)
    private readonly instituteRepository: Repository<Institute>,

    @InjectRepository(InstitutePrograms)
    private readonly ipRepository: Repository<InstitutePrograms>,

    @InjectRepository(InstituteProgramCourse)
    private readonly ipc: Repository<InstituteProgramCourse>,

    @InjectRepository(InstitutePrograms)
    private readonly ip: Repository<InstitutePrograms>,
    @InjectRepository(SystemUser)
    private readonly sysUserRepository: Repository<SystemUser>,

    @InjectRepository(ProgramCourse)
    private readonly pc: Repository<ProgramCourse>,
  ) {}

  // ✅ إنشاء برنامج بدون معهد (العزل لاحق بالـ assign)
  async create(
    createProgramDto: CreateProgramDto,
    userId: number,
    logo?: Express.Multer.File,
  ) {
    const user = await this.sysUserRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`System user with ID ${userId} not found`);
    }
    const baseUrl = process.env.APP_URL || '';
    const logoPath = logo
      ? `${baseUrl}/uploads/program-images/${logo.filename}`
      : '';
    const program = this.programRepository.create({
      createdBy: user,
      logo: logoPath,
      isActive: 1,
    });

    const savedProgram = await this.programRepository.save(program);

    // حفظ الترجمات
    const translations = await Promise.all(
      createProgramDto.translations.map(async (t) => {
        const language = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!language) {
          throw new NotFoundException(
            `Language with ID ${t.languageId} not found`,
          );
        }

        const translation = this.programTranslationRepository.create({
          name: t.name,
          description: t.description,
          program: savedProgram,
          language,
        });
        return this.programTranslationRepository.save(translation);
      }),
    );

    return { ...savedProgram, translations };
  }
  async findAll(languageId?: number) {
    const query = this.programRepository
      .createQueryBuilder('program')
      .leftJoin(
        'program.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')
      .leftJoin('program.createdBy', 'createdBy')

      // ✅ select الأساسي
      .select([
        'program.id AS program_id',
        'program.logo AS program_logo',
        'program.isActive AS isActive',
        'program.createdAt AS program_createdAt',
        'translation.name AS translation_name',
        'translation.description AS translation_description',
        'language.id AS language_id',
        'createdBy.id AS created_by_id',
        'createdBy.full_name AS created_by_name',
      ])

      // ✅ subquery بعده
      .addSelect(
        `(SELECT COUNT(pc.id)
        FROM program_course pc
        WHERE pc.program_id = program.id)`,
        'courses_count',
      );

    const rows = await query.getRawMany<ProgramRaw>();

    return rows.map((row) => ({
      id: row.program_id,
      logo: row.program_logo,
      isActive: row.isActive,
      createdAt: row.program_createdAt,
      name: row.translation_name,
      description: row.translation_description,
      languageId: row.language_id,

      // ✅ الاسم الصح
      courses_count: Number(row.courses_count),
      createdBy: {
        id: row.created_by_id,
        full_name: row.created_by_name,
      },
    }));
  }

  async findOne(id: number) {
    const rows = await this.programRepository
      .createQueryBuilder('program')
      .leftJoin('program.translations', 'translation')
      .leftJoin('translation.language', 'language')
      .leftJoin('program.createdBy', 'createdBy')
      .select([
        'program.id AS program_id',
        'program.logo AS program_logo',
        'program.isActive AS isActive',
        'translation.name AS translation_name',
        'translation.description AS translation_description',
        'language.id AS language_id',
        'createdBy.id AS created_by_id',
        'createdBy.full_name AS created_by_name',
        'program.createdAt AS program_createdAt',
      ])
      .where('program.id = :id', { id })
      .getRawMany<ProgramRaw>();

    if (!rows.length) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return {
      id: rows[0].program_id,
      logo: rows[0].program_logo,
      isActive: rows[0].isActive,
      createdAt: rows[0].program_createdAt,
      translations: rows.map((row) => ({
        name: row.translation_name,
        description: row.translation_description,
        languageId: row.language_id,
      })),
      createdBy: {
        id: rows[0].created_by_id,
        full_name: rows[0].created_by_name,
      },
    };
  }

  // ✅ برامج عامة متاحة لكل المعاهد للاختيار منها
  async findAllForSelection(languageId?: number) {
    const programs = await this.programRepository.find({
      relations: ['translations', 'translations.language'],
      where: { isActive: 1 },
    });

    return programs.map((program) => {
      const selectedTranslation =
        program.translations.find((t) => t.language.id === languageId) ||
        program.translations[0];
      return {
        id: program.id,
        logo: program.logo,
        name: selectedTranslation?.name ?? null,
        description: selectedTranslation?.description ?? null,
      };
    });
  }

  // ✅ عرض برامج معهد محدد فقط (بعزل كامل)
  async findAProgramsForInstitute(
    languageId?: number,
    userInstituteId?: number,
  ) {
    if (!userInstituteId)
      throw new BadRequestException('Institute ID is required.');

    const programIds = await this.ipRepository
      .createQueryBuilder('ip')
      .select('DISTINCT ip.program', 'programId')
      .where('ip.institute = :iid', { iid: userInstituteId })
      .getRawMany<{ programId: number }>();

    if (!programIds.length) return [];

    const ids = programIds.map((p) => p.programId);

    const programs = await this.programRepository.find({
      where: { id: In(ids) },
      relations: ['translations', 'translations.language'],
    });

    return programs.map((program) => {
      const tr =
        program.translations.find((t) => t.language.id === languageId) ||
        program.translations[0];
      return {
        id: program.id,
        logo: program.logo,
        name: tr?.name,
        description: tr?.description,
      };
    });
  }

  // // ✅ جلب برنامج واحد خاص بالمعهد الحالي فقط (Isolation)
  async findOneAProgramForInstitute(
    id: number,
    userInstituteId?: number,
    languageId?: number,
  ) {
    const link = await this.ipRepository.findOne({
      where: {
        institute: { id: userInstituteId },
        program: { id },
      },
      relations: [
        'program',
        'program.translations',
        'program.translations.language',
      ],
    });

    if (!link) throw new ForbiddenException(`Program ${id} not accessible.`);

    const program = link.program;
    const tr =
      program.translations.find((t) => t.language.id === languageId) ||
      program.translations[0];

    return {
      id: program.id,
      logo: program.logo,
      name: tr?.name,
      description: tr?.description,
    };
  }

  // ✅ تحديث البرنامج (logo + translations)
  async update(id: number, dto: UpdateProgramDto, logo?: Express.Multer.File) {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });

    if (!program) throw new NotFoundException(`Program ${id} not found`);
    if (logo) {
      const baseUrl = process.env.APP_URL || '';
      program.logo = `${baseUrl}/uploads/program-images/${logo.filename}`;
    }
    if (dto.translations?.length) {
      for (const t of dto.translations) {
        const lang = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!lang)
          throw new NotFoundException(`Language ${t.languageId} not found`);

        const existing = program.translations.find(
          (tr) => tr.language.id === t.languageId,
        );

        if (existing) {
          existing.name = t.name;
          existing.description = t.description;
          await this.programTranslationRepository.save(existing);
        } else {
          const newTranslation = this.programTranslationRepository.create({
            name: t.name,
            description: t.description,
            program,
            language: lang,
          });
          await this.programTranslationRepository.save(newTranslation);
        }
      }
    }

    await this.programRepository.save(program);
    return this.findOne(id);
  }

  // ✅ حذف البرنامج (soft delete)
  async remove(id: number) {
    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) throw new NotFoundException(`Program ${id} not found`);

    await this.programRepository.softDelete(id);
    return { message: `Program ${id} deleted successfully` };
  }

  // ✅ Assign Program to Institutes
  async assignProgramToInstitute(instituteId: number, programId: number) {
    const [institute, program] = await Promise.all([
      this.instituteRepository.findOne({ where: { id: instituteId } }),
      this.programRepository.findOne({ where: { id: programId } }),
    ]);

    if (!institute)
      throw new NotFoundException(`Institute ${instituteId} not found`);

    if (!program) throw new NotFoundException(`Program ${programId} not found`);

    const link = await this.ipRepository.findOne({
      where: {
        institute: { id: instituteId },
        program: { id: programId },
      },
      withDeleted: true, // مهم
    });

    // موجود ومفعل
    if (link && !link.deleted_at) {
      throw new ConflictException('Program already in institute');
    }

    // موجود بس soft-deleted → restore
    if (link && link.deleted_at) {
      await this.ipRepository.restore(link.id);
      return { message: 'Program re-assigned to institute successfully.' };
    }

    // مش موجود خالص → create
    await this.ipRepository.save(
      this.ipRepository.create({
        institute: { id: instituteId },
        program: { id: programId },
        is_active: 1,
      }),
    );

    return { message: 'Program assigned to institute successfully.' };
  }

  async removeFromInstitute(programId: number, instituteId: number) {
    const link = await this.ipRepository.findOne({
      where: { program: { id: programId }, institute: { id: instituteId } },
      withDeleted: true,
    });

    if (!link) {
      throw new NotFoundException(
        `No link found for program ${programId} with institute ${instituteId}`,
      );
    }

    if (link.deleted_at) {
      return { message: 'Already unassigned (soft-deleted before).' };
    }

    // soft delete by id
    await this.ipRepository.softDelete(link.id);

    return {
      message: `Program ${programId} soft-unassigned from institute ${instituteId}.`,
    };
  }

  async restoreProgramForInstitute(programId: number, instituteId: number) {
    const link = await this.ipRepository.findOne({
      where: { program: { id: programId }, institute: { id: instituteId } },
      withDeleted: true,
    });

    if (!link) {
      throw new NotFoundException(
        `No link found for program ${programId} with institute ${instituteId}`,
      );
    }

    if (!link.deleted_at) {
      return { message: 'Link is already active.' };
    }

    await this.ipRepository.restore(link.id);
    return {
      message: `Program ${programId} restored for institute ${instituteId}.`,
    };
  }

  async toggleActive(id: number) {
    const program = await this.programRepository.findOne({ where: { id } });
    if (!program) throw new NotFoundException(`Program ${id} not found`);
    program.isActive = program.isActive ? 0 : 1;
    await this.programRepository.save(program);
    return {
      message: `Program ${id} is now ${
        program.isActive ? 'active' : 'inactive'
      }.`,
    };
  }

  async ProgramDropDown(instituteId: number, languageId?: number) {
    const rows = await this.programRepository
      .createQueryBuilder('program')

      .leftJoin(
        'program.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )

      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from('institute_programs', 'ip')
          .where('ip.program_id = program.id')
          .andWhere('ip.institute_id = :instituteId')
          .getQuery();

        return `NOT EXISTS ${subQuery}`;
      })

      .setParameter('instituteId', instituteId)

      .select([
        'program.id AS program_id',
        'translation.name AS translation_name',
      ])
      .getRawMany<ProgramRaw>();

    return rows.map((r) => ({
      id: r.program_id,
      name: r.translation_name,
    }));
  }
  async ProgramsForUserDropDown(instituteId: number, languageId?: number) {
    const rows = await this.programRepository
      .createQueryBuilder('program')

      .innerJoin(
        'program.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .innerJoin('program.institutePrograms', 'ip')
      .where('ip.institute_id = :instituteId', { instituteId })
      .select([
        'program.id AS program_id',
        'translation.name AS translation_name',
      ])
      .getRawMany<ProgramRaw>();

    return rows.map((r) => ({
      id: r.program_id,
      name: r.translation_name,
    }));
  }

  async programsAndCoursesForInstitute(
    instituteId: number,
    languageId?: number,
  ) {
    const query = this.ip
      .createQueryBuilder('ip')
      .leftJoin('ip.institute', 'institute')
      .where('institute.id = :instituteId', { instituteId })
      .leftJoin('ip.program', 'program')
      .leftJoin(
        'program.translations',
        'ptrs',
        languageId ? 'ptrs.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('ptrs.language', 'planguage')
      .leftJoin(
        'program.instituteProgramCourses',
        'ipc',
        'ipc.instituteId = :instituteId',
        { instituteId },
      )
      .leftJoin('ipc.course', 'course')
      .leftJoin(
        'course.translations',
        'ctrs',
        languageId ? 'ctrs.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('ctrs.language', 'clanguage')
      .select([
        'program.id AS program_id',
        'ptrs.name AS translation_name',
        'course.id AS course_id',
        'ctrs.name AS course_name',
      ]);
    const rows = await query.getRawMany<ProgramRaw>();
    const programs = {};
    for (const row of rows) {
      if (!programs[row.program_id]) {
        programs[row.program_id] = {
          id: row.program_id,
          name: row.translation_name,
          courses: [],
        };
      }
      if (row.course_id) {
        programs[row.program_id].courses.push({
          id: row.course_id,
          name: row.course_name,
        });
      }
    }
    return Object.values(programs);
  }
  async institutesStatsForProgram(programId: number, languageId?: number) {
    const query = this.instituteRepository
      .createQueryBuilder('i')

      // ✅ 1️⃣ get institutes linked to this program
      .innerJoin(
        'institute_programs',
        'ip',
        'ip.institute_id = i.id AND ip.program_id = :programId',
        { programId },
      )

      // ✅ 2️⃣ get courses for this institute + program combination
      .leftJoin(
        'institute_program_course',
        'ipc',
        'ipc.instituteId = ip.institute_id AND ipc.programId = ip.program_id',
      )

      // ✅ 3️⃣ translation
      .leftJoin(
        'i.translations',
        'it',
        languageId ? 'it.languageId = :languageId' : '1=1',
        languageId ? { languageId } : {},
      )

      // ✅ 4️⃣ students for this institute + program
      .leftJoin(
        'user',
        'u',
        `u.institute_id = i.id 
       AND u.program_id = :programId 
       AND u.deletedAt IS NULL 
       AND u.is_active = 1`,
        { programId },
      )

      .select([
        'i.id    AS institute_id',
        'i.logo  AS institute_logo',
        'it.name AS institute_name',
      ])
      .addSelect('COUNT(DISTINCT ipc.courseId)', 'courses_count')
      .addSelect('COUNT(DISTINCT u.id)', 'students_count')

      .groupBy('i.id')
      .addGroupBy('i.logo')
      .addGroupBy('it.name');

    const rows = await query.getRawMany<ProgramRaw>();

    return rows.map((row) => ({
      instituteId: row.institute_id,
      logo: row.institute_logo,
      name: row.institute_name,
      coursesCount: Number(row.courses_count),
      studentsCount: Number(row.students_count),
    }));
  }

  async getProgramsForCourse(courseId: number, languageId?: number) {
    const rows = await this.pc
      .createQueryBuilder('pc')
      .innerJoin('pc.course', 'course')
      .innerJoin('pc.program', 'program')
      .leftJoin(
        'program.translations',
        'pt',
        languageId ? 'pt.languageId = :languageId' : undefined,
        languageId ? { languageId } : {},
      )
      .where('course.id = :courseId', { courseId })
      .andWhere('pc.is_active = 1')
      .andWhere('program.isActive = 1')
      .select([
        'program.id   AS program_id',
        'pt.name      AS translation_name',
      ])
      .distinct(true) // ✅ أهم حاجة
      .getRawMany<ProgramRaw>();

    return {
      message: 'Programs for course',
      data: rows.map((r) => ({
        id: r.program_id,
        name: r.translation_name ?? null,
      })),
    };
  }
}
