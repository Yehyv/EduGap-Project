import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { CourseTranslation } from './entities/course-translation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { In } from 'typeorm';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(CourseTranslation)
    private courseTranslationRepository: Repository<CourseTranslation>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createCourseDto: CreateCourseDto, userInstituteId: number) {
    let programs: Program[] = [];
    if (createCourseDto.programIds.length > 0) {
      // تأكد إن البرامج تنتمي لمعهد الـ user
      programs = await this.programRepository
        .createQueryBuilder('program')
        .leftJoin('program.institutes', 'institute')
        .where('program.id IN (:...programIds)', {
          programIds: createCourseDto.programIds,
        })
        .andWhere('institute.id = :instituteId', {
          instituteId: userInstituteId,
        })
        .getMany();

      if (programs.length !== createCourseDto.programIds.length) {
        throw new NotFoundException(
          'One or more programs not found or not accessible',
        );
      }
    }

    const course = this.courseRepository.create({
      image: createCourseDto.image,
      translations: createCourseDto.translations,
      programs,
      durateionTime: createCourseDto.durationTime,
      lessonNumber: createCourseDto.lessonsNumber ?? 0,
      level: createCourseDto.level ?? 'Beginner',
      rate: createCourseDto.rate ?? 0,
      numberOfReviewers: createCourseDto.numberOfReviewers ?? 0,
    });

    const savedCourse = await this.courseRepository.save(course);

    const translations = await Promise.all(
      createCourseDto.translations.map(async (translation) => {
        const language = await this.languageRepository.findOne({
          where: { id: translation.languageId },
        });
        if (!language) {
          throw new Error(
            `Language with ID ${translation.languageId} not found`,
          );
        }
        const courseTranslation = this.courseTranslationRepository.create({
          name: translation.name,
          description: translation.description,
          levelName: translation.levelName,
          whatToLearn: translation.whatToLearn,
          course: savedCourse,
          language: language,
        });
        return this.courseTranslationRepository.save(courseTranslation);
      }),
    );
    return { savedCourse, translations };
  }

  async findAll(
    userInstituteId: number,
    languageId?: number,
    page: number = 1,
    limit = 8,
  ) {
    const skip = (page - 1) * limit;

    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect(
        'course.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('course.programs', 'programs')
      .where('institute.id = :instituteId', { instituteId: userInstituteId })
      .skip(skip)
      .take(limit)
      .getMany();

    return courses.map((course) => {
      let selectedTranslation: CourseTranslation;

      if (languageId) {
        selectedTranslation = course.translations[0] || null;
      } else {
        selectedTranslation = course.translations[0] || null;
      }

      return {
        id: course.id,
        image: course.image,
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        programs: course.programs || [],
      };
    });
  }

  async findOne(id: number, userInstituteId: number, languageId?: number) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('course.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'language')
      .leftJoinAndSelect('course.programs', 'programs')
      .where('course.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!course) {
      throw new NotFoundException(`Course ${id} not found or not accessible`);
    }

    const selectedTranslation =
      course.translations.find((t) => t.language.id === languageId) ||
      course.translations[0];

    return {
      id: course.id,
      image: course.image,
      name: selectedTranslation?.name,
      description: selectedTranslation?.description,
      programs: course.programs || [],
    };
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    userInstituteId: number,
  ) {
    // تأكد إن الكورس ينتمي لمعهد الـ user
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('course.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'language')
      .leftJoinAndSelect('course.programs', 'programs')
      .where('course.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!course) {
      throw new NotFoundException(`Course ${id} not found or not accessible`);
    }

    // Update image if provided
    if (updateCourseDto.image) {
      course.image = updateCourseDto.image;
    }

    // Update program assignments (تأكد إن البرامج تنتمي لنفس المعهد)
    if (updateCourseDto.programIds !== undefined) {
      if (updateCourseDto.programIds.length > 0) {
        const programs = await this.programRepository
          .createQueryBuilder('program')
          .leftJoin('program.institutes', 'institute')
          .where('program.id IN (:...programIds)', {
            programIds: updateCourseDto.programIds,
          })
          .andWhere('institute.id = :instituteId', {
            instituteId: userInstituteId,
          })
          .getMany();

        if (programs.length !== updateCourseDto.programIds.length) {
          throw new NotFoundException(
            'One or more programs not found or not accessible',
          );
        }

        course.programs = programs;
      } else {
        course.programs = [];
      }
    }

    // Update translations
    if (updateCourseDto.translations) {
      for (const t of updateCourseDto.translations) {
        const language = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!language) {
          throw new NotFoundException(`Language ${t.languageId} not found`);
        }

        const translation = await this.courseTranslationRepository.findOne({
          where: {
            course: { id },
            language: { id: t.languageId },
          },
        });

        if (!t.name || !t.description) {
          throw new BadRequestException(
            'Name and description are required for translations',
          );
        }

        if (translation) {
          translation.name = t.name;
          translation.description = t.description;
          await this.courseTranslationRepository.save(translation);
        } else {
          const newTranslation = this.courseTranslationRepository.create({
            name: t.name,
            description: t.description,
            language,
            course,
          });
          await this.courseTranslationRepository.save(newTranslation);
        }
      }
    }

    await this.courseRepository.save(course);
    return this.findOne(id, userInstituteId);
  }

  async remove(id: number, userInstituteId: number) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('course.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!course) {
      throw new NotFoundException(`Course ${id} not found or not accessible`);
    }

    await this.courseRepository.softDelete(id);
    return { message: `Course ${id} removed` };
  }

  async assignToPrograms(
    courseId: number,
    programIds: number[],
    userInstituteId: number,
  ) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('course.programs', 'programs')
      .where('course.id = :courseId', { courseId })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!course) {
      throw new NotFoundException(
        `Course ${courseId} not found or not accessible`,
      );
    }

    const programs = await this.programRepository
      .createQueryBuilder('program')
      .leftJoin('program.institutes', 'institute')
      .where('program.id IN (:...programIds)', { programIds })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getMany();

    if (programs.length !== programIds.length) {
      throw new NotFoundException(
        'One or more programs not found or not accessible',
      );
    }

    course.programs = programs;
    await this.courseRepository.save(course);

    return this.findOne(courseId, userInstituteId);
  }

  async removeFromPrograms(
    courseId: number,
    programIds: number[],
    userInstituteId: number,
  ) {
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('course.programs', 'programs')
      .where('course.id = :courseId', { courseId })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!course) {
      throw new NotFoundException(
        `Course ${courseId} not found or not accessible`,
      );
    }

    course.programs = course.programs.filter(
      (program) => !programIds.includes(program.id),
    );

    await this.courseRepository.save(course);
    return this.findOne(courseId, userInstituteId);
  }

  async findFirstEight(userInstituteId: number, languageId?: number) {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect(
        'course.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('course.programs', 'programs')
      .where('institute.id = :instituteId', { instituteId: userInstituteId })
      .take(8)
      .getMany();

    return courses.map((course) => {
      const selectedTranslation = course.translations[0] || null;

      return {
        id: course.id,
        image: course.image,
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        programs: course.programs || [],
      };
    });
  }

  async findByPrograms(
    programIds: number[],
    userInstituteId: number,
    languageId?: number,
  ) {
    if (!programIds || programIds.length === 0) {
      throw new BadRequestException('You must provide at least one programId');
    }

    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('course.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('course.programs', 'programs')
      .where('program.id IN (:...programIds)', { programIds })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getMany();

    return courses.map((course) => {
      const selectedTranslation = languageId
        ? course.translations.find((t) => t.language.id === languageId) ||
          course.translations[0]
        : course.translations[0];

      return {
        id: course.id,
        image: course.image,
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        programs: course.programs || [],
      };
    });
  }
  async getPopularCourses(limit = 10) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.enrollments', 'enrollment')
      .leftJoinAndSelect('course.translations', 'translations')
      .groupBy('course.id')
      .addGroupBy('translations.id')
      .orderBy('COUNT(enrollment.id)', 'DESC')
      .limit(limit)
      .getMany();
  }
  async findAllForVisitors(
    languageId?: number,
    page: number = 1,
    limit: number = 8,
  ) {
    const skip = (page - 1) * limit;

    const [courses, total] = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect(
        'course.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('course.programs', 'programs')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const formattedCourses = courses.map((course) => {
      const selectedTranslation = course.translations[0] || null;

      return {
        id: course.id,
        image: course.image,
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        programs: course.programs || [],
      };
    });
    return {
      formattedCourses,
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
  async findFirstEightForVisitors(languageId?: number) {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect(
        'course.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('course.programs', 'programs')
      .take(8) // أول 8 كورسات فقط
      .getMany();

    return courses.map((course) => {
      const selectedTranslation = course.translations[0] || null;

      return {
        id: course.id,
        image: course.image,
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        programs: course.programs || [],
      };
    });
  }
}
