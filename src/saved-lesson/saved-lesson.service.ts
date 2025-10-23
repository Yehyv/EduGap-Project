// src/saved-lesson/saved-lesson.service.ts
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
import { CreateSavedLessonDto } from './dto/create-saved-lesson.dto';

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

  /** Save (idempotent + soft-restore) */
  async saveLesson(userId: number, dto: CreateSavedLessonDto) {
    // 1) هات الدرس + استنتج المحتوى لو مش مبعوت
    const lesson = await this.lessonRepo.findOne({
      where: { id: dto.lessonId },
      relations: ['topic', 'topic.content'],
    });
    if (!lesson)
      throw new NotFoundException(`Lesson ${dto.lessonId} not found`);

    const derivedContent = lesson.topic?.content;
    const contentId = dto.contentId ?? derivedContent?.id;
    if (!contentId) {
      throw new NotFoundException(
        `Content not found through lesson->topic for lesson ${dto.lessonId}`,
      );
    }

    const content = dto.contentId
      ? await this.contentRepo.findOne({ where: { id: contentId } })
      : derivedContent;
    if (!content) throw new NotFoundException(`Content ${contentId} not found`);

    // 2) دور حتى لو متشال سوفت (withDeleted) عشان نعمل restore
    const existing = await this.savedRepo.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lesson.id },
        content: { id: content.id },
      } as FindOptionsWhere<SavedLesson>,
      withDeleted: true,
      relations: ['lesson', 'content'],
    });

    if (existing) {
      // لو متشال سوفت → ريستور
      if (existing.deleted_at) {
        await this.savedRepo.restore(existing.id);
      }
      // already active → رجّع نفس الراو
      return this.findOne(existing.id);
    }

    // 3) أنشئ Save جديد
    const row = this.savedRepo.create({
      user: { id: userId },
      lesson: { id: lesson.id },
      content: { id: content.id },
    });
    const saved = await this.savedRepo.save(row);
    return this.findOne(saved.id);
  }

  /** Unsave (soft delete) */
  async unsaveLesson(userId: number, lessonId: number, contentId?: number) {
    // استنتاج contentId لو مش مبعوت
    if (!contentId) {
      const lesson = await this.lessonRepo.findOne({
        where: { id: lessonId },
        relations: ['topic', 'topic.content'],
      });
      if (!lesson) throw new NotFoundException(`Lesson ${lessonId} not found`);
      contentId = lesson.topic?.content?.id;
    }
    if (!contentId)
      throw new BadRequestException('contentId is required or derivable');

    const existing = await this.savedRepo.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lessonId },
        content: { id: contentId },
      } as FindOptionsWhere<SavedLesson>,
    });
    if (!existing) {
      // idempotent: لو مش موجود اعتبرها تمام
      return { message: 'Already unsaved' };
    }

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

    // نجيب مع العلاقات اللازمة لعرض أسماء التراجم والصور… إلخ
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
      // pick translations حسب languageId أو أول ترجمة
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
