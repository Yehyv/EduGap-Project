import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { Repository } from 'typeorm';
import { ContentTranslation } from './entities/content-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Course } from 'src/courses/entities/course.entity';
import { ContentCategory } from 'src/course-categories/entities/content-category.entity';
import { Educator } from 'src/educators/entities/educator.entity';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(ContentTranslation)
    private contentTranslationRepository: Repository<ContentTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(ContentCategory)
    private categoryRepository: Repository<ContentCategory>,
    @InjectRepository(Educator)
    private educatorRepository: Repository<Educator>,
  ) {}

  async create(createContentDto: CreateContentDto, userInstituteId: number) {
    let courses: Course[] = [];
    const category = await this.categoryRepository.findOne({
      where: { id: createContentDto.categoryId },
    });
    const educators = await this.educatorRepository
      .createQueryBuilder('educator')
      .where('educator.id IN (:...educatorIds)', {
        educatorIds: createContentDto.educatorIds,
      })
      .getMany();
    if (!category) throw new NotFoundException('category not found ');
    if (createContentDto.courseIds.length > 0) {
      // تأكد إن الكورسات تنتمي لمعهد الـ user عبر الـ programs
      courses = await this.courseRepository
        .createQueryBuilder('course')
        .leftJoin('course.programs', 'program')
        .leftJoin('program.institutes', 'institute')
        .where('course.id IN (:...courseIds)', {
          courseIds: createContentDto.courseIds,
        })
        .andWhere('institute.id = :instituteId', {
          instituteId: userInstituteId,
        })
        .getMany();

      if (courses.length !== createContentDto.courseIds.length) {
        throw new NotFoundException(
          'One or more courses not found or not accessible',
        );
      }
    }

    const content = this.contentRepository.create({
      image: createContentDto.image,
      rate: createContentDto.rate ?? 0,
      courses: courses,
      educators: educators,
      contentCategory: category,
    });

    const savedContent = await this.contentRepository.save(content);

    const translations = await Promise.all(
      createContentDto.translations.map(async (translation) => {
        const language = await this.languageRepository.findOne({
          where: { id: translation.languageId },
        });
        if (!language) {
          throw new Error(
            `Language with ID ${translation.languageId} not found`,
          );
        }
        const contentTranslation = this.contentTranslationRepository.create({
          name: translation.name,
          description: translation.description,
          whatToLearn: translation.whatToLearn,
          levelName: translation.levelName,
          durationTime: translation.durationTime,
          content: savedContent,
          language: language,
        });
        return this.contentTranslationRepository.save(contentTranslation);
      }),
    );
    return { savedContent, translations };
  }

  async findAll(
    userInstituteId?: number,
    languageId?: number,
    userId?: number,
    page: number = 1,
    limit: number = 8,
  ) {
    const skip = (page - 1) * limit;
    const query = this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.courses', 'courses')
      .leftJoinAndSelect('content.educators', 'educators')
      .leftJoinAndSelect('educators.user', 'user')
      .loadRelationCountAndMap(
        'content.lessonsCount',
        'content.topics',
        'topic',
        (qb) => qb.leftJoin('topic.lessons', 'lesson'),
      )
      .loadRelationCountAndMap(
        'content.completedLessonsCount',
        'content.topics',
        'topic',
        (qb) => {
          if (!userId) return qb; // لو guest، ما نفلترش على progress
          return qb
            .leftJoin('topic.lessons', 'lesson')
            .leftJoin(
              'lesson.progresses',
              'lessonProgress',
              'lessonProgress.status = :status AND lessonProgress.enrollment.user.id = :userId',
              {
                status: 'completed',
                userId,
              },
            );
        },
      )
      .skip(skip)
      .take(limit);
    if (userInstituteId) {
      query.where('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }
    const [contents, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);
    const formattedContents = contents.map((content) => {
      let selectedTranslation: ContentTranslation;

      if (languageId) {
        selectedTranslation = content.translations[0] || null;
      } else {
        selectedTranslation = content.translations[0] || null;
      }

      return {
        id: content.id,
        image: content.image,
        rate: content.rate,
        lessonsCount: content.lessonsCount ?? 0,
        completedLessonsCount: content.completedLessonsCount ?? 0,
        levelName: selectedTranslation?.levelName || '',
        whatToLearn: selectedTranslation?.whatToLearn || '',
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        durationTime: selectedTranslation?.durationTime || '',
        educators: content.educators.map((e) => ({
          id: e.id,
          title: e.title,
          bio: e.bio,
          image: e.image,
          firstName: e.user.firstName,
          lastName: e.user.lastName,
        })),
      };
    });
    return {
      formattedContents,
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

  async findOne(id: number, userInstituteId: number, languageId?: number) {
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('content.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'language')
      .leftJoinAndSelect('content.courses', 'courses')
      .leftJoinAndSelect('content.educators', 'educators')
      .leftJoinAndSelect('educators.user', 'user')
      .loadRelationCountAndMap(
        'content.lessonsCount',
        'content.topics',
        'topic',
        (qb) => qb.leftJoin('topic.lessons', 'lesson'),
      )
      .where('content.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!content) {
      throw new NotFoundException(
        `Content with ID ${id} not found or not accessible`,
      );
    }

    const selectedTranslation =
      content.translations.find((t) => t.language.id === languageId) ||
      content.translations[0];

    return {
      id: content.id,
      image: content.image,
      rate: content.rate,
      lessonsCount: content.lessonsCount ?? 0,
      levelName: selectedTranslation?.levelName || '',
      whatToLearn: selectedTranslation?.whatToLearn || '',
      name: selectedTranslation?.name || '',
      description: selectedTranslation?.description || '',
      durationTime: selectedTranslation.durationTime,
      educators: content.educators.map((e) => ({
        id: e.id,
        title: e.title,
        bio: e.bio,
        image: e.image,
        firstName: e.user.firstName,
        lastName: e.user.lastName,
      })),
    };
  }

  async update(
    id: number,
    updateContentDto: UpdateContentDto,
    userInstituteId: number,
  ) {
    // تأكد إن المحتوى ينتمي لمعهد الـ user
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('content.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'language')
      .leftJoinAndSelect('content.courses', 'courses')
      .where('content.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!content) {
      throw new NotFoundException(
        `Content with ID ${id} not found or not accessible`,
      );
    }

    if (updateContentDto.image) {
      content.image = updateContentDto.image;
    }

    if (updateContentDto.rate !== undefined) {
      content.rate = updateContentDto.rate;
    }

    if (updateContentDto.level !== undefined) {
      content.level = updateContentDto.level;
    }

    if (updateContentDto.numberOfReviewers !== undefined) {
      content.numberOfReviewers = updateContentDto.numberOfReviewers;
    }

    if (updateContentDto.rate !== undefined) {
      content.rate = updateContentDto.rate;
    }

    if (updateContentDto.courseIds !== undefined) {
      if (updateContentDto.courseIds.length > 0) {
        // تأكد إن الكورسات تنتمي لنفس المعهد
        const courses = await this.courseRepository
          .createQueryBuilder('course')
          .leftJoin('course.programs', 'program')
          .leftJoin('program.institutes', 'institute')
          .where('course.id IN (:...courseIds)', {
            courseIds: updateContentDto.courseIds,
          })
          .andWhere('institute.id = :instituteId', {
            instituteId: userInstituteId,
          })
          .getMany();

        if (courses.length !== updateContentDto.courseIds.length) {
          throw new NotFoundException(
            'One or more courses not found or not accessible',
          );
        }
        content.courses = courses;
      } else {
        content.courses = [];
      }
    }

    if (updateContentDto.translations) {
      for (const t of updateContentDto.translations) {
        const language = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!language) {
          throw new NotFoundException(
            `Language with ID ${t.languageId} not found`,
          );
        }

        const translation = await this.contentTranslationRepository.findOne({
          where: {
            content: { id },
            language: { id: t.languageId },
          },
        });

        if (!t.name || !t.description) {
          throw new BadRequestException(
            'Name and description are required for new translations',
          );
        }

        if (translation) {
          translation.name = t.name;
          translation.description = t.description;
          await this.contentTranslationRepository.save(translation);
        } else {
          const newTranslation = this.contentTranslationRepository.create({
            name: t.name,
            description: t.description,
            levelName: t.levelName,
            whatToLearn: t.whatToLearn,
            durationTime: t.durationTime,
            language,
            content,
          });
          await this.contentTranslationRepository.save(newTranslation);
        }
      }
    }

    await this.contentRepository.save(content);
    return this.findOne(id, userInstituteId);
  }

  async remove(id: number, userInstituteId?: number) {
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('content.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!content) {
      throw new NotFoundException(
        `Content with ID ${id} not found or not accessible`,
      );
    }

    await this.contentRepository.softDelete(id);
    return { message: `Content with ID ${id} has been deleted` };
  }

  async assignToCourses(
    contentId: number,
    courseIds: number[],
    userInstituteId: number,
  ) {
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('content.courses', 'courses')
      .where('content.id = :contentId', { contentId })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!content) {
      throw new NotFoundException(
        `Content ${contentId} not found or not accessible`,
      );
    }

    // تأكد إن الكورسات تنتمي لنفس المعهد
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getMany();

    if (courses.length !== courseIds.length) {
      throw new NotFoundException(
        'One or more courses not found or not accessible',
      );
    }

    content.courses = courses;
    await this.contentRepository.save(content);

    return this.findOne(contentId, userInstituteId);
  }

  async removeFromCourses(
    contentId: number,
    courseIds: number[],
    userInstituteId: number,
  ) {
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('content.courses', 'courses')
      .where('content.id = :contentId', { contentId })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!content) {
      throw new NotFoundException(
        `Content ${contentId} not found or not accessible`,
      );
    }

    content.courses = content.courses.filter(
      (course) => !courseIds.includes(course.id),
    );

    await this.contentRepository.save(content);

    return this.findOne(contentId, userInstituteId);
  }

  // Helper method لجلب المحتوى حسب الكورسات
  async findByCourses(
    courseIds: number[],
    userInstituteId: number,
    languageId?: number,
  ) {
    if (!courseIds || courseIds.length === 0) {
      throw new BadRequestException('You must provide at least one courseId');
    }

    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('content.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.courses', 'courses')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getMany();

    return contents.map((content) => {
      const selectedTranslation = languageId
        ? content.translations.find((t) => t.language.id === languageId) ||
          content.translations[0]
        : content.translations[0];

      return {
        id: content.id,
        image: content.image,
        rate: content.rate,
        levelName: selectedTranslation?.levelName || '',
        whatToLearn: selectedTranslation?.whatToLearn || '',
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        durationTime: selectedTranslation?.durationTime || '',
        courses: content.courses || [],
      };
    });
  }
  async findFirstEight(languageId?: number, userInstituteId?: number) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.courses', 'courses')
      .leftJoinAndSelect('content.educators', 'educators')
      .leftJoinAndSelect('educators.user', 'user')
      .loadRelationCountAndMap(
        'content.lessonsCount',
        'content.topics',
        'topic',
        (qb) => qb.leftJoin('topic.lessons', 'lesson'),
      )
      .orderBy('content.id', 'ASC')
      .take(8);
    if (userInstituteId) {
      query.where('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }
    const contents = await query.getMany();
    return contents.map((content) => {
      let selectedTranslation: ContentTranslation;

      if (languageId) {
        selectedTranslation = content.translations[0] || null;
      } else {
        selectedTranslation = content.translations[0] || null;
      }

      return {
        id: content.id,
        image: content.image,
        rate: content.rate,
        lessonsCount: content.lessonsCount ?? 0,
        levelName: selectedTranslation?.levelName || '',
        whatToLearn: selectedTranslation?.whatToLearn || '',
        name: selectedTranslation?.name || '',
        description: selectedTranslation?.description || '',
        durationTime: selectedTranslation.durationTime || '',
        educators: content.educators.map((e) => ({
          id: e.id,
          title: e.title,
          bio: e.bio,
          image: e.image,
          firstName: e.user.firstName,
          lastName: e.user.lastName,
        })),
      };
    });
  }
}
