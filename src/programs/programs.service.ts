import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
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
  ) {}

  // ✅ إنشاء برنامج بدون معهد (العزل لاحق بالـ assign)
  async create(createProgramDto: CreateProgramDto, logo?: Express.Multer.File) {
    const baseUrl = process.env.APP_URL || '';
    const logoPath = logo
      ? `${baseUrl}/uploads/program-images/${logo.filename}`
      : '';
    const program = this.programRepository.create({
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
      .select([
        'program.id',
        'program.logo',
        'program.isActive AS isActive',
        'program.createdAt AS program_createdAt',
        'translation.name',
        'translation.description',
        'language.id',
      ]);
    const rows = await query.getRawMany<ProgramRaw>();
    return rows.map((row) => ({
      id: row.program_id,
      logo: row.program_logo,
      isActive: row.isActive,
      createdAt: row.program_createdAt,
      name: row.translation_name,
      description: row.translation_description,
      languageId: row.language_id,
    }));
  }
  async findOne(id: number, languageId?: number) {
    const query = this.programRepository
      .createQueryBuilder('program')
      .leftJoin(
        'program.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')
      .select([
        'program.id',
        'program.logo',
        'program.isActive AS isActive',
        'translation.name',
        'translation.description',
        'language.id',
      ])
      .where('program.id = :id', { id });
    const row = await query.getRawOne<ProgramRaw>();
    if (!row) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return {
      id: row.program_id,
      logo: row.program_logo,
      isActive: row.isActive,
      name: row.translation_name,
      description: row.translation_description,
      languageId: row.language_id,
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
    const exist = await this.ipRepository.findOne({
      where: { institute: { id: instituteId }, program: { id: programId } },
    });
    if (!exist) {
      await this.ipRepository.save(
        this.ipRepository.create({
          institute: { id: instituteId },
          program: { id: programId },
          is_active: 1,
        }),
      );
    }
    return { message: 'Program assigned to institute successfully.' };
  }

  // ✅ Unassign program from specific institutes
  // async removeFromInstitutes(programId: number, instituteIds: number[]) {
  //   await this.ipRepository
  //     .createQueryBuilder()
  //     .delete()
  //     .where('program_id = :pid', { pid: programId })
  //     .andWhere('institute_id IN (:...iids)', { iids: instituteIds })
  //     .execute();

  //   return { message: `Program ${programId} unassigned successfully.` };
  // }
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
  async ProgramDropDown(languageId?: number) {
    const query = this.programRepository
      .createQueryBuilder('program')
      .leftJoin(
        'program.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language')
      .select([
        'program.id AS program_id',
        'translation.name AS translation_name',
      ]);
    const rows = await query.getRawMany<ProgramRaw>();
    return rows.map((r) => ({
      id: r.program_id,
      name: r.translation_name,
    }));
  }
  async programsAndCoursesForInstitute(
    instituteId: number,
    languageId?: number,
  ) {
    const query = this.ipc
      .createQueryBuilder('ipc')
      .leftJoin('ipc.institute', 'institute')
      .where('institute.id = :instituteId', { instituteId })
      .leftJoin('ipc.program', 'program')
      .leftJoin(
        'program.translations',
        'ptrs',
        languageId ? 'ptrs.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('ptrs.language', 'planguage')
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
    return rows.map((pr) => ({
      id: pr.program_id,
      name: pr.translation_name,
      courses: {
        id: pr.course_id,
        name: pr.course_name,
      },
    }));
  }
}
