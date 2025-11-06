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
        // 'content', // ❌ مش محتاجينها دلوقتي
      ],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const pickLessonName = (r: SavedLesson) => {
      const tr = languageId
        ? r.lesson?.translations?.find((t) => t.language?.id === languageId)
        : r.lesson?.translations?.[0];
      return tr?.name ?? '';
    };

    const pickTopicName = (r: SavedLesson) => {
      const tr = languageId
        ? r.lesson?.topic?.translations?.find(
            (t) => t.language?.id === languageId,
          )
        : r.lesson?.topic?.translations?.[0];
      return tr?.name ?? '';
    };

    type Bucket = {
      topic: { id: number | null; name: string };
      lessons: Array<{
        savedId: number;
        savedAt: Date;
        id: number | null;
        name: string;
        duration: number;
      }>;
    };

    const byTopic = new Map<number, Bucket>();

    for (const r of rows) {
      const topicId = r.lesson?.topic?.id ?? -1;
      if (topicId === -1) continue;

      if (!byTopic.has(topicId)) {
        byTopic.set(topicId, {
          topic: { id: r.lesson?.topic?.id ?? null, name: pickTopicName(r) },
          lessons: [],
        });
      }

      byTopic.get(topicId)!.lessons.push({
        savedId: r.id,
        savedAt: r.created_at,
        id: r.lesson?.id ?? null,
        name: pickLessonName(r),
        duration: r.lesson?.duration ?? 0,
      });
    }

    const items = Array.from(byTopic.values());

    return {
      items, // [{ topic: {id,name}, lessons: [...] }]
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
  async getUserSavedLessonsForContent(
    userId: number,
    contentId: number,
    languageId?: number,
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    // فلترة مباشرة على SavedLesson.content.id
    const [rows, total] = await this.savedRepo.findAndCount({
      where: {
        user: { id: userId },
        content: { id: contentId },
      },
      relations: [
        'lesson',
        'lesson.translations',
        'lesson.translations.language',
        'lesson.topic',
        'lesson.topic.translations',
        'lesson.topic.translations.language',
        'lesson.topic.content', // للتيقّن/الفاليديشـن
        'content', // عندنا أصلاً لكن مش هنرجّعه في الـ response
      ],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // ✅ في حالة قديمة مافيهاش content على السجل (لو عندك بيانات تراثية)
    // بنفلتر احتياطيًا على level التطبيق (مش هيأثر لو كل السجلات سليمة)
    const filtered = rows.filter(
      (r) =>
        r.content?.id === contentId ||
        r.lesson?.topic?.content?.id === contentId,
    );

    const pickLessonName = (r: SavedLesson) => {
      const tr = languageId
        ? r.lesson?.translations?.find((t) => t.language?.id === languageId)
        : r.lesson?.translations?.[0];
      return tr?.name ?? '';
    };

    const pickTopicName = (r: SavedLesson) => {
      const tr = languageId
        ? r.lesson?.topic?.translations?.find(
            (t) => t.language?.id === languageId,
          )
        : r.lesson?.topic?.translations?.[0];
      return tr?.name ?? '';
    };

    type Bucket = {
      topic: { id: number; name: string };
      lessons: Array<{
        savedId: number;
        savedAt: Date;
        id: number;
        name: string;
        duration: number;
      }>;
    };

    const byTopic = new Map<number, Bucket>();

    for (const r of filtered) {
      const topicId = r.lesson?.topic?.id;
      if (!topicId) continue;

      if (!byTopic.has(topicId)) {
        byTopic.set(topicId, {
          topic: { id: topicId, name: pickTopicName(r) },
          lessons: [],
        });
      }

      byTopic.get(topicId)!.lessons.push({
        savedId: r.id,
        savedAt: r.created_at,
        id: r.lesson.id,
        name: pickLessonName(r),
        duration: r.lesson?.duration ?? 0,
      });
    }

    // رجّع توبيكات فيها دروس محفوظة فقط
    const items = Array.from(byTopic.values());

    return {
      contentId, // للوضوح
      items, // [{ topic:{id,name}, lessons:[...] }]
      pagination: {
        page,
        limit,
        total, // إجمالي السجلات قبل التجميع
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
