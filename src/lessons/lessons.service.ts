import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { LessonTranslation } from './entities/lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { Student } from 'src/students/entities/student.entity';

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
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
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
    const lesson = this.lessonRepository.create({ topic });
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
    userId: number,
    userInstituteId?: number,
    languageId?: number,
  ) {
    const query = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoin(
        'lesson.progresses',
        'lessonProgress',
        'lessonProgress.studentId = :userId',
        {
          userId,
        },
      )
      .leftJoin('lesson.translations', 'translation') // لازم عشان languageId
      .where('lessonProgress.status = :status', { status: 'in progress' });

    // لو فيه معهد
    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    // لو فيه لغة
    if (languageId) {
      query.andWhere('translation.languageId = :languageId', { languageId });
    }

    const lessons = await query.getMany();

    if (!lessons.length) {
      throw new NotFoundException('No lessons in progress found');
    }

    return lessons;
  }
}
