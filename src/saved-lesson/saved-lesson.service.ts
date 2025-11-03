import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { SavedLesson } from './entities/saved-lesson.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Content } from 'src/contents/entities/content.entity';

@Injectable()
export class SavedLessonService {
  constructor(
    @InjectRepository(SavedLesson)
    private readonly savedRepo: Repository<SavedLesson>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
  ) {}

  /** TOGGLE: first press = save, second press = unsave (soft-delete) */
  async toggleSave(userId: number, lessonId: number) {
    // 1) Load lesson and derive content via lesson.topic.content
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['topic', 'topic.content'],
    });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const content = lesson.topic?.content;
    if (!content) {
      throw new NotFoundException(
        `Content not found through lesson->topic for lesson ${lessonId}`,
      );
    }

    // 2) Find existing (including soft-deleted)
    let existing = await this.savedRepo.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lesson.id },
        content: { id: content.id },
      } as FindOptionsWhere<SavedLesson>,
      withDeleted: true,
      relations: ['lesson', 'content'],
    });

    // 3) No record → create (saved)
    if (!existing) {
      const row = this.savedRepo.create({
        user: { id: userId },
        lesson: { id: lesson.id },
        content: { id: content.id },
      });
      const saved = await this.savedRepo.save(row);
      return {
        status: 'saved' as const,
        id: saved.id,
        savedAt: saved.created_at,
        lessonId: lesson.id,
        contentId: content.id,
      };
    }

    // 4) Was soft-deleted → restore (saved)
    if (existing.deleted_at) {
      await this.savedRepo.restore(existing.id);
      existing = await this.savedRepo.findOne({
        where: { id: existing.id },
        relations: ['lesson', 'content'],
      });
      return {
        status: 'saved' as const,
        id: existing!.id,
        savedAt: existing!.created_at,
        lessonId: lesson.id,
        contentId: content.id,
      };
    }

    // 5) Active → second press unsaves
    await this.savedRepo.softDelete(existing.id);
    return {
      status: 'unsaved' as const,
      id: existing.id,
      lessonId: lesson.id,
      contentId: content.id,
    };
  }

  /** Explicit unsave by lessonId (idempotent) */
  async unsaveByLesson(userId: number, lessonId: number) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['topic', 'topic.content'],
    });
    if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);
    const contentId = lesson.topic?.content?.id;
    if (!contentId) throw new BadRequestException('contentId is not derivable');

    const existing = await this.savedRepo.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lessonId },
        content: { id: contentId },
      } as FindOptionsWhere<SavedLesson>,
    });
    if (!existing) return { message: 'Already unsaved' };

    await this.savedRepo.softDelete(existing.id);
    return { message: 'Unsaved successfully' };
  }

  /** Get user's saved lessons (paginated + language aware) */
  async getUserSavedLessons(
    userId: number,
    languageId?: number,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    const [rows, total] = await this.savedRepo.findAndCount({
      where: { user: { id: userId } },
      relations: [
        'lesson',
        'lesson.translations',
        'lesson.translations.language',
        'lesson.topic',
        'lesson.topic.translations',
        'lesson.topic.translations.language',
        'content',
      ],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const items = rows.map((r) => {
      const lessonTr =
        (languageId
          ? r.lesson?.translations?.find((t) => t.language?.id === languageId)
          : null) ||
        r.lesson?.translations?.[0] ||
        null;

      const topicTr =
        (languageId
          ? r.lesson?.topic?.translations?.find(
              (t) => t.language?.id === languageId,
            )
          : null) ||
        r.lesson?.topic?.translations?.[0] ||
        null;

      return {
        id: r.id,
        savedAt: r.created_at,
        lesson: {
          id: r.lesson?.id,
          name: lessonTr?.name ?? '',
          duration: r.lesson?.duration ?? 0,
          topic: {
            id: r.lesson?.topic?.id,
            name: topicTr?.name ?? '',
          },
        },
        content: r.content
          ? { id: r.content.id, image: r.content.image ?? null }
          : null,
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

  /** Helper: read one */
  async findOne(id: number) {
    const r = await this.savedRepo.findOne({
      where: { id },
      relations: ['lesson', 'content'],
    });
    if (!r) throw new NotFoundException(`SavedLesson ${id} not found`);
    return {
      id: r.id,
      savedAt: r.created_at,
      lessonId: r.lesson?.id ?? null,
      contentId: r.content?.id ?? null,
    };
  }
}
