import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { LessonTranslation } from './entities/lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { title } from 'process';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(LessonTranslation)
    private lessonTranslationRepository: Repository<LessonTranslation>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}
  async create(createLessonDto: CreateLessonDto, userInstituteId?: number) {
    const topic = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('topic.id = :topicId', { topicId: createLessonDto.topicId })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();
    if (!topic) throw new Error(`Topic not found`);
    const lesson = this.lessonRepository.create({
      imageUrl: createLessonDto.imageUrl,
      topic,
    });
    const savedLesson = await this.lessonRepository.save(lesson);
    const translations = await Promise.all(
      createLessonDto.translations.map(async (translation) => {
        const language = await this.languageRepository.findOne({
          where: { id: translation.languageId },
        });
        if (!language) {
          throw new Error(
            `Language with ID ${translation.languageId} not found`,
          );
        }
        const lessonTranslation = this.lessonTranslationRepository.create({
          name: translation.name,
          description: translation.description,
          lesson: savedLesson,
          language,
        });
        return this.lessonTranslationRepository.save(lessonTranslation);
      }),
    );
    return { ...savedLesson, translations };
  }

  async findAll(languageId?: number, userInstituteId?: number) {
    const query = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoinAndSelect('lesson.translations', 'lessonTranslation')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute');

    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    if (languageId) {
      query.andWhere('lessonTranslation.languageId = :languageId', {
        languageId,
      });
    }

    return query.getMany();
  }

  findOne(id: number, languageId?: number, userInstituteId?: number) {
    const query = this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('topic.translations', 'translation')
      .where('lesson.id = :id', { id })
      .andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });

    if (languageId) {
      query.andWhere('translation.languageId = :languageId', { languageId });
    }

    return query.getOne();
  }

  async update(
    id: number,
    updateLessonDto: UpdateLessonDto,
    userInstituteId?: number,
  ) {
    const lesson = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('topic.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('lesson.id = :id', { id })
      .andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      })
      .getOne();
    if (!lesson) throw new NotFoundException('Lesson not found');

    if (updateLessonDto.topicId) {
      const topic = await this.topicRepository
        .createQueryBuilder('topic')
        .leftJoin('topic.content', 'content')
        .leftJoin('content.courses', 'course')
        .leftJoin('course.programs', 'program')
        .leftJoin('program.institutes', 'institute')
        .where('topic.id = :topicId', { topicId: updateLessonDto.topicId })
        .andWhere('institute.id = :instituteId', {
          instituteId: userInstituteId,
        })
        .getOne();
      if (!topic)
        throw new NotFoundException('Topic not found for this institute');
      lesson.topic = topic;
    }

    if (updateLessonDto.translations) {
      await this.lessonTranslationRepository.delete({ lesson: { id } });
      const translations = await Promise.all(
        updateLessonDto.translations.map(async (translation) => {
          const language = await this.languageRepository.findOne({
            where: { id: translation.languageId },
          });
          if (!language)
            throw new NotFoundException(
              `Language with ID ${translation.languageId} not found`,
            );

          const lessonTranslation = this.lessonTranslationRepository.create({
            name: translation.name,
            description: translation.description,
            lesson,
            language,
          });
          return this.lessonTranslationRepository.save(lessonTranslation);
        }),
      );
      lesson.translations = translations;
    }
    return this.lessonRepository.save(lesson);
  }

  async remove(id: number, userInstituteId?: number) {
    const lesson = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('topic.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('lesson.id = :id', { id })
      .andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      })
      .getOne();
    if (!lesson) throw new NotFoundException(`Lesson not found`);
    await this.lessonRepository.softDelete(id);
  }
  async findAllInProgress(
    userId?: number, // لو guest يبقى undefined
    userInstituteId?: number,
    languageId?: number,
    page: number = 1,
    limit: number = 8,
  ) {
    const skip = (page - 1) * limit;
    const query = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect(
        'lesson.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoinAndSelect('topic.content', 'content')
      .leftJoinAndSelect(
        'content.translations',
        'contentTranslation',
        languageId ? 'contentTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('content.educators', 'educator')
      .leftJoinAndSelect('educator.user', 'user')
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
          return qb
            .leftJoin('topic.lessons', 'lesson')
            .leftJoin(
              'lesson.progresses',
              'lessonProgress',
              'lessonProgress.status = :status',
              { status: 'completed' },
            )
            .leftJoin('lessonProgress.enrollment', 'enrollment')
            .leftJoin('enrollment.user', 'progressUser')
            .andWhere('progressUser.id = :userId', { userId });
        },
      )
      .leftJoinAndSelect('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoin('lesson.progresses', 'lessonProgress')
      .leftJoin('lessonProgress.enrollment', 'enrollment')
      .skip(skip)
      .take(limit);

    if (userId) {
      query
        .andWhere('lessonProgress.status = :progressStatus', {
          progressStatus: 'in progress',
        })
        .andWhere('enrollment.user.id = :userId', { userId });
    }

    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    if (languageId) {
      query.andWhere('translation.language.id = :languageId', { languageId });
    }

    const [lessons, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      lessons: lessons.map((lesson) => {
        const lessonTranslation = lesson.translations?.[0] || null;
        return {
          lessonId: lesson.id,
          lessonName: lessonTranslation?.name,
          content: {
            id: lesson.topic.content.id,
            lessonsCount: lesson.topic.content.lessonsCount ?? 0,
            completedLessonsCount:
              lesson.topic.content.completedLessonsCount ?? 0,
            rate: lesson.topic.content.rate,
            name: lesson.topic.content.translations?.[0]?.name || null,
          },
          educators: lesson.topic.content.educators.map((e) => ({
            id: e.id,
            title: e.title,
            firstName: e.user.firstName,
            lastName: e.user.lastName,
          })),
        };
      }),
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
  async findFirstEight(
    userId?: number, // لو guest يبقى undefined
    userInstituteId?: number,
    languageId?: number,
  ) {
    const query = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect(
        'lesson.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoinAndSelect('topic.content', 'content')
      .leftJoinAndSelect(
        'content.translations',
        'contentTranslation',
        languageId ? 'contentTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('content.educators', 'educator')
      .leftJoinAndSelect('educator.user', 'user')
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
          return qb
            .leftJoin('topic.lessons', 'lesson')
            .leftJoin(
              'lesson.progresses',
              'lessonProgress',
              'lessonProgress.status = :status',
              { status: 'completed' },
            )
            .leftJoin('lessonProgress.enrollment', 'enrollment')
            .leftJoin('enrollment.user', 'progressUser')
            .andWhere('progressUser.id = :userId', { userId });
        },
      )
      .leftJoinAndSelect('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoin('lesson.progresses', 'lessonProgress')
      .leftJoin('lessonProgress.enrollment', 'enrollment')
      .take(8);

    if (userId) {
      query
        .andWhere('lessonProgress.status = :progressStatus', {
          progressStatus: 'in progress',
        })
        .andWhere('enrollment.user.id = :userId', { userId });
    }

    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    if (languageId) {
      query.andWhere('translation.language.id = :languageId', { languageId });
    }

    const lessons = await query.getMany();
    return lessons.map((lesson) => {
      const lessonTranslation = lesson.translations?.[0] || null;
      console.log(
        lesson.topic.content.lessonsCount,
        lesson.topic.content.completedLessonsCount,
      );
      return {
        lessonId: lesson.id,
        lessonName: lessonTranslation.name,
        content: {
          id: lesson.topic.content.id,
          lessonsCount: lesson.topic.content.lessonsCount ?? 0,
          completedLessonsCount:
            lesson.topic.content.completedLessonsCount ?? 0,
          rate: lesson.topic.content.rate,
          name: lesson.topic.content.translations?.[0].name || null,
        },
        educators: lesson.topic.content.educators.map((e) => ({
          id: e.id,
          title: e.title,
          firstName: e.user.firstName,
          lastName: e.user.lastName,
        })),
      };
    });
  }
}
