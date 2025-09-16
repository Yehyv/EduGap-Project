import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContentDetailsService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}
  baseContentQuery(languageId?: number) {
    return this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect(
        'content.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('content.topics', 'topic')
      .leftJoinAndSelect(
        'topic.translations',
        'topicTranslation',
        languageId ? 'topicTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('topic.lessons', 'lesson')
      .leftJoinAndSelect(
        'lesson.translations',
        'lessonTranslation',
        languageId ? 'lessonTranslation.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('content.educators', 'educators')
      .leftJoinAndSelect('educators.user', 'user');
  }
  async contentDetailsBeforeEnroll(id: number, languageId?: number) {
    const query = this.baseContentQuery(languageId).where('content.id = :id', {
      id,
    });
    const content = await query.getOne();
    if (!content) {
      throw new NotFoundException(
        `Content with ID ${id} not found or not accessible`,
      );
    }
    const selectedTranslation = content.translations?.[0] || null;
    return {
      id: content.id,
      image: content.image,
      rate: content.rate,
      numberOfReviewers: content.numberOfReviewers ?? 0,
      adVideo: content.adVideo,
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
  }
  async contentDetailsAfterEnroll(
    id: number,
    userId: number,
    languageId?: number,
  ) {
    const query = this.baseContentQuery(languageId)
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

      .where('content.id = :id', { id });
    const content = await query.getOne();
    if (!content) {
      throw new NotFoundException(
        `Content with ID ${id} not found or not accessible`,
      );
    }
    const selectedTranslation = content.translations?.[0] || null;
    return {
      id: content.id,
      image: content.image,
      rate: content.rate,
      lessonsCount: content.lessonsCount ?? 0,
      completedLessonsCount: content.completedLessonsCount ?? 0,
      numberOfReviewers: content.numberOfReviewers ?? 0,
      adVideo: content.adVideo,
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
      topic: content.topics.map((t) => {
        const topicTranslation = t.translations?.[0] || null;
        return {
          id: t.id,
          name: topicTranslation?.name || '',
          lessons: t.lessons.map((l) => {
            const lessonTranslation = l.translations?.[0] || null;
            return {
              id: l.id,
              imageUrl: l.imageUrl,
              name: lessonTranslation?.name || '',
            };
          }),
        };
      }),
    };
  }
}
