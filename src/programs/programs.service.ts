import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { Language } from 'src/languages/entities/language.entity';
import { ProgramTranslation } from './entities/program-translation.entity';
import { Institute } from 'src/institutes/entities/institute.entity';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(ProgramTranslation)
    private programTranslationRepository: Repository<ProgramTranslation>,
    @InjectRepository(Institute)
    private instituteRepository: Repository<Institute>,
  ) {}
  async create(createProgramDto: CreateProgramDto) {
    let institute: Institute[] = [];
    if (createProgramDto.instituteIds.length > 0) {
      institute = await this.instituteRepository.findByIds(
        createProgramDto.instituteIds,
      );
      if (institute.length !== createProgramDto.instituteIds.length) {
        throw new NotFoundException('One or more institutes not found');
      }
    }
    const program = this.programRepository.create({
      logo: createProgramDto.logo,
      institutes: institute,
    });
    const savedProgram = await this.programRepository.save(program);
    const translations = await Promise.all(
      createProgramDto.translations.map(async (translation) => {
        const Language = await this.languageRepository.findOne({
          where: { id: translation.languageId },
        });
        if (!Language) {
          throw new Error(
            `Language with ID ${translation.languageId} not found`,
          );
        }
        const programTranslation = this.programTranslationRepository.create({
          name: translation.name,
          description: translation.description,
          program: { id: savedProgram.id },
          language: { id: Language.id },
        });
        return this.programTranslationRepository.save(programTranslation);
      }),
    );
    return { ...savedProgram, translations };
  }
  async findAll(userInstituteId: number, languageId?: number) {
    // جيب البرامج الخاصة بمعهد الـ user فقط
    const programs = await this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .leftJoinAndSelect(
        'program.translations',
        'translation',
        languageId ? 'translation.language.id = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .where('institute.id = :instituteId', { instituteId: userInstituteId })
      .getMany();

    return programs.map((program) => {
      let selectedTranslation: ProgramTranslation;
      if (languageId) {
        selectedTranslation = program.translations[0] || null;
      } else {
        selectedTranslation = program.translations[0] || null;
      }
      return {
        id: program.id,
        logo: program.logo,
        name: selectedTranslation ? selectedTranslation.name : null,
        description: selectedTranslation
          ? selectedTranslation.description
          : null,
        institutes: program.institutes || [],
      };
    });
  }

  async findOne(id: number, userInstituteId: number, languageId?: number) {
    const program = await this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .leftJoinAndSelect('program.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'language')
      .where('program.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!program) {
      throw new NotFoundException(
        `Program with ID ${id} not found or not accessible`,
      );
    }

    const selectedTranslation =
      program.translations.find(
        (translation) => translation.language.id === languageId,
      ) || program.translations[0];

    return {
      id: program.id,
      logo: program.logo,
      name: selectedTranslation ? selectedTranslation.name : null,
      description: selectedTranslation ? selectedTranslation.description : null,
      institutes: program.institutes || [],
    };
  }

  async update(
    id: number,
    updateProgramDto: UpdateProgramDto,
    userInstituteId: number,
  ) {
    // تأكد إن البرنامج ينتمي لمعهد الـ user
    const program = await this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .leftJoinAndSelect('program.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'language')
      .where('program.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!program) {
      throw new NotFoundException(`Program ${id} not found or not accessible`);
    }

    if (updateProgramDto.logo) {
      program.logo = updateProgramDto.logo;
    }

    // تحديث الترجمات
    if (updateProgramDto.translations) {
      for (const t of updateProgramDto.translations) {
        const language = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!language)
          throw new NotFoundException(`Language ${t.languageId} not found`);

        const translation = await this.programTranslationRepository.findOne({
          where: { program: { id }, language: { id: t.languageId } },
        });

        if (translation) {
          translation.name = t.name;
          translation.description = t.description;
          await this.programTranslationRepository.save(translation);
        } else {
          const newTranslation = this.programTranslationRepository.create({
            name: t.name,
            description: t.description,
            language,
            program,
          });
          await this.programTranslationRepository.save(newTranslation);
        }
      }
    }

    await this.programRepository.save(program);
    return this.findOne(id, userInstituteId);
  }

  async remove(id: number, userInstituteId: number) {
    // تأكد إن البرنامج ينتمي لمعهد الـ user
    const program = await this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .where('program.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!program) {
      throw new NotFoundException(`Program ${id} not found or not accessible`);
    }

    await this.programRepository.softDelete(id);
    return { message: `Program ${id} deleted successfully` };
  }

  // هذول للـ admin - مش محتاجين تعديل كبير
  async assignToInstitutes(programId: number, instituteIds: number[]) {
    const program = await this.programRepository.findOne({
      where: { id: programId },
      relations: ['institutes'],
    });
    if (!program) {
      throw new NotFoundException(`Program ${programId} not found`);
    }
    const institutes = await this.instituteRepository.findBy({
      id: In(instituteIds),
    });
    if (institutes.length !== instituteIds.length) {
      throw new NotFoundException('One or more institutes not found');
    }
    program.institutes = institutes;
    await this.programRepository.save(program);
    return this.findOne(programId, instituteIds[0]); // استخدم أول معهد للعرض
  }

  async removeFromInstitutes(programId: number, instituteIds: number[]) {
    const program = await this.programRepository.findOne({
      where: { id: programId },
      relations: ['institutes'],
    });
    if (!program) {
      throw new NotFoundException(`Program ${programId} not found`);
    }
    program.institutes = program.institutes.filter(
      (institute) => !instituteIds.includes(institute.id),
    );
    await this.programRepository.save(program);
    // استخدم أول معهد متبقي للعرض
    const remainingInstitute = program.institutes[0];
    return this.findOne(
      programId,
      remainingInstitute ? remainingInstitute.id : 1,
    );
  }
}
