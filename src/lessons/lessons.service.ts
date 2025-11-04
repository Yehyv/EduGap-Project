/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial  } from 'typeorm';

import { Lesson } from './entities/lesson.entity';
import { LessonTranslation } from './entities/lesson-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Topic } from 'src/topics/entities/topic.entity';

import { CreateLessonDto, LessonTranslationDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { getVideoDuration } from './video-utils';
import { LessonReaction } from 'src/lesson-reactions/entities/lesson-reaction.entity';
import { SavedLesson } from 'src/saved-lesson/entities/saved-lesson.entity';
type ReactionStatus = 'liked' | 'disliked' | 'none';
type SavedStatus = 'saved' | 'unsaved';
@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonTranslation)
    private readonly lessonTrRepo: Repository<LessonTranslation>,
    @InjectRepository(Language)
    private readonly langRepo: Repository<Language>,
    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
    @InjectRepository(LessonReaction)
  private readonly reactionRepo: Repository<LessonReaction>,
  @InjectRepository(SavedLesson)
  private readonly savedRepo: Repository<SavedLesson>,
  ) {}

  /** احسب الترتيب التالي داخل نفس الـ Topic */
  private async getNextOrderForTopic(topicId: number): Promise<number> {
  const raw = await this.lessonRepo
    .createQueryBuilder('l')
    .select('MAX(l.order_id)', 'max')
    .where('l.topicId = :tid', { tid: topicId })
    .getRawOne<{ max: string | null }>(); // قد ترجع undefined و/أو string

  // حوّل القيمة لرقم بأمان
  const maxNum = raw?.max != null ? Number(raw.max) : NaN;
  const safeMax = Number.isFinite(maxNum) ? maxNum : -1;

  return safeMax + 1;
}


  /** إنشاء Lesson داخل Topic محدد (بدون أي عزل معهد/كورس) */
 async create(dto: CreateLessonDto) {
  const topic = await this.topicRepo.findOne({ where: { id: dto.topicId } });
  if (!topic) throw new NotFoundException('Topic not found');

  const order = dto.orderId ?? (await this.getNextOrderForTopic(dto.topicId));

  // ✅ حساب المدة لو فيه فيديو
  let duration: number | undefined = undefined;
  if (dto.videoLink) {
    const dur = await getVideoDuration(dto.videoLink);
    if (dur) duration = dur;
  }

  const payload: DeepPartial<Lesson> = {
    topic,
    duration,
    order_id: order,
    video_link: dto.videoLink ?? undefined,
    lesson_type: dto.lessonType ?? 0,
    questions_percentage_score:
      (dto.lessonType ?? 0) === 1
        ? (dto.questionsPercentageScore ?? undefined)
        : undefined,
    is_active: dto.isActive ?? 1,
  };

  const lesson = this.lessonRepo.create(payload);
  const saved = await this.lessonRepo.save(lesson);
  await this.createOrReplaceTranslations(saved, dto.translations);

  return this.findOne(saved.id);
}


  /** كل الدروس (فلترة اختيارية باللغة والـ topic) */
  async findAll(languageId?: number, topicId?: number) {
    const qb = this.lessonRepo
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.translations', 'tr');

    if (topicId) qb.where('lesson.topicId = :topicId', { topicId });
    if (languageId) qb.andWhere('tr.language_id = :languageId', { languageId });

    qb
      .leftJoinAndSelect('lesson.topic', 'topic')
      .orderBy('lesson.topicId', 'ASC')
      .addOrderBy('lesson.order_id', 'ASC')
      .addOrderBy('lesson.id', 'ASC');

    return qb.getMany();
  }

  /** درس واحد (يدعم languageId اختياري لتصفية الترجمة) */
  async findOne(id: number, languageId?: number) {
    const qb = this.lessonRepo
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.translations', 'tr')
      .leftJoinAndSelect('tr.language', 'lang')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .where('lesson.id = :id', { id });

    if (languageId) qb.andWhere('tr.language_id = :languageId', { languageId });

    const lesson = await qb.getOne();
    if (!lesson) throw new NotFoundException('Lesson not found');

    return lesson;
  }

  /** تحديث درس: تغيير topic/order/is_active/.. + استبدال الترجمات لو مبعوتة */
  async update(id: number, dto: UpdateLessonDto) {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['topic', 'translations'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // تغيير الـ Topic لو مبعوت
    if (dto.topicId && dto.topicId !== lesson.topic?.id) {
      const newTopic = await this.topicRepo.findOne({ where: { id: dto.topicId } });
      if (!newTopic) throw new NotFoundException('Topic not found');
      lesson.topic = newTopic;

      if (dto.orderId === undefined) {
        // لو ماحددش order للـ Topic الجديد، نحسب ترتيب جديد تلقائي
        lesson.order_id = await this.getNextOrderForTopic(newTopic.id);
      }
    }

    if (dto.duration !== undefined) lesson.duration = dto.duration;
    if (dto.orderId !== undefined) lesson.order_id = dto.orderId;
    if (dto.videoLink !== undefined) lesson.video_link = dto.videoLink;
    if (dto.lessonType !== undefined) lesson.lesson_type = dto.lessonType;
    if (dto.questionsPercentageScore !== undefined) {
      const q = dto.questionsPercentageScore;
      if (q !== null && (q < 0 || q > 100))
        throw new BadRequestException('questionsPercentageScore must be between 0 and 100');
      lesson.questions_percentage_score = q;
    }
    if (dto.isActive !== undefined) lesson.is_active = dto.isActive;

    // استبدال الترجمات لو مبعوتة
    if (dto.translations) {
      await this.lessonTrRepo.delete({ lesson: { id } });
      await this.createOrReplaceTranslations(lesson, dto.translations);
    }

    await this.lessonRepo.save(lesson);
    return this.findOne(id);
  }

  /** حذف (Soft delete) */
  async remove(id: number) {
    const found = await this.lessonRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Lesson not found');
    await this.lessonRepo.softDelete(id);
  }

  /** helper لإنشاء/استبدال الترجمات */
  private async createOrReplaceTranslations(
    lesson: Lesson,
    translations: LessonTranslationDto[],
  ) {
    for (const t of translations) {
      const lang = await this.langRepo.findOne({ where: { id: t.languageId } });
      if (!lang) {
        throw new NotFoundException(`Language with ID ${t.languageId} not found`);
      }
      const tr = this.lessonTrRepo.create({
        name: t.name,
        description: t.description,
        lesson,
        language: lang,
      });
      await this.lessonTrRepo.save(tr);
    }
  }

  async getLessonContent(lessonId: number, languageId?: number) {
  const qb = this.lessonRepo
    .createQueryBuilder('lesson')
    // نجيب ترجمة واحدة حسب اللغة المطلوبة (إن وجدت)
    .leftJoinAndSelect(
      'lesson.translations',
      'tr',
      languageId ? 'tr.languageId = :languageId' : undefined,
      { languageId },
    )
    // نرجّع الحقول الخفيفة فقط
    .select([
      'lesson.id',
      'lesson.order_id',
      'lesson.video_link',
      'tr.id',
      'tr.name',
    ])
    .where('lesson.id = :lessonId', { lessonId });

  const entity = await qb.getOne();
  if (!entity) throw new NotFoundException('Lesson not found');

  const name = entity.translations?.[0]?.name ?? '';

  return {
    id: entity.id,
    order: entity.order_id ?? null,
    name,
    video: entity.video_link ?? null,
  };
}

async getLessonActionsStatus(userId: number, lessonId: number) {
  // 1) هات الدرس + المحتوى المشتق (lesson.topic.content) لو موجود
  const lesson = await this.lessonRepo.findOne({
    where: { id: lessonId },
    relations: ['topic', 'topic.content'],
  });
  if (!lesson) throw new NotFoundException('Lesson not found');

  // 2) Reaction (لو فيه سجل reaction=1 يبقى liked، غير كده unliked)
  const reactionRow = await this.reactionRepo.findOne({
    where: { lesson: { id: lessonId }, user: { id: userId } },
    select: ['id', 'reaction'],
  });
   let reactionStatus: ReactionStatus = 'none';
  if (reactionRow) {
    if (reactionRow.reaction === 1) reactionStatus = 'liked';
    else if (reactionRow.reaction === 0) reactionStatus = 'disliked';
  }

  // 3) Saved (لو مفيش content مرتبط نرجّع unsaved)
  const contentId = lesson.topic?.content?.id ?? null;
  let savedStatus: SavedStatus = 'unsaved';
  if (contentId) {
    const savedRow = await this.savedRepo.findOne({
      where: {
        user: { id: userId },
        lesson: { id: lessonId },
        content: { id: contentId },
      },
      select: ['id'],
    });
    savedStatus = savedRow ? 'saved' : 'unsaved';
  }

  // 4) النتيجة
  return {
    lessonId,
    reactionStatus,
    savedStatus,
  };
}
}
