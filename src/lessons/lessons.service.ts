/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial  } from 'typeorm';

import { Lesson, LessonType } from './entities/lesson.entity';
import { LessonTranslation } from './entities/lesson-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Topic } from 'src/topics/entities/topic.entity';

import { CreateLessonDto, LessonTranslationDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { getVideoDuration } from './video-utils';
import { LessonReaction } from 'src/lesson-reactions/entities/lesson-reaction.entity';
import { SavedLesson } from 'src/saved-lesson/entities/saved-lesson.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { Content } from 'src/contents/entities/content.entity';
import { TopicWithLessonsStatus } from './types/lesson-status.types';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

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
    @InjectRepository(Content) private readonly contentRepo: Repository<Content>,
    @InjectRepository(Enrollment) private readonly enrollRepo: Repository<Enrollment>,
    @InjectRepository(LessonProgress) private readonly progressRepo: Repository<LessonProgress>,
    @InjectRepository(SystemUser) private readonly sysUserRepo: Repository<SystemUser>,
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
 
async create(dto: CreateLessonDto, userId: number, image?: Express.Multer.File ) {
  const topic = await this.topicRepo.findOne({ where: { id: dto.topicId } });
  if (!topic) throw new NotFoundException('Topic not found');
  const user = await this.sysUserRepo.findOne({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');
  const baseUrl = process.env.APP_URL || '';
  const imageUrl = image
      ? `${baseUrl}/uploads/lesson-images/${image.filename}`
      : '';

  const order = dto.orderId ?? (await this.getNextOrderForTopic(dto.topicId));

  // ✅ حساب المدة لو فيه فيديو
  let duration: number | undefined = undefined;
  if (dto.videoLink) {
    const dur = await getVideoDuration(dto.videoLink);
    console.log('VIDEO DURATION =', dur);
    if (dur) duration = dur;
  }

  const payload: DeepPartial<Lesson> = {
    topic,
    duration,
    order_id: order,
    video_link: dto.videoLink ?? undefined,
    lesson_type: dto.lessonType ?? 0,
    image: imageUrl,
    createdBy: user,
    questions_percentage_score:
      (dto.lessonType ?? 0) === 1
        ? (dto.questionsPercentageScore ?? undefined)
        : undefined,
    is_active: dto.isActive ?? 1,
  };

  const lesson = this.lessonRepo.create(payload);
  const saved = await this.lessonRepo.save(lesson);
  await this.createOrReplaceTranslations(saved, dto.translations);

  return saved;
}

  /** كل الدروس (فلترة اختيارية باللغة والـ topic) */
  async findAll(languageId?: number, topicId?: number) {
    const qb = this.lessonRepo
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.translations', 'tr')
      .leftJoinAndSelect('lesson.createdBy', 'createdBy');

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
  async findOne(id: number, topicId?: number) {
  const qb = this.lessonRepo
    .createQueryBuilder('lesson')
    .leftJoinAndSelect('lesson.translations', 'translation')
    .leftJoin('translation.language', 'language')
    .leftJoin('lesson.topic', 'topic')
    .leftJoin('topic.translations', 'tt')
    .leftJoin('tt.language', 'ttlang')
    .leftJoin('lesson.createdBy', 'createdBy')
    .where('lesson.id = :id', { id });

  if (topicId !== undefined) {
    qb.andWhere('topic.id = :topicId', { topicId });
  }

  const lesson = await qb.getOne();
  if (!lesson) throw new NotFoundException('Lesson not found');

  return lesson;
}



  /** تحديث درس: تغيير topic/order/is_active/.. + استبدال الترجمات لو مبعوتة */
  async update(id: number, dto: UpdateLessonDto, image?: Express.Multer.File) {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['topic'],
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
    if(image) {
      const baseUrl = process.env.APP_URL || '';
      const imageUrl = image
      ? `${baseUrl}/uploads/lesson-images/${image.filename}`
      : '';
      lesson.image = imageUrl;
    }

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
    if(dto.translations?.length) {
      for (const t of dto.translations) {
        const lang = await this.langRepo.findOne({
          where: { id: t.languageId}
        });
        if (!lang) throw new NotFoundException(`Language ${t.languageId} not found`);
        const existing = await this.lessonTrRepo.findOne({ 
          where: { lesson: {id}, language: { id: t.languageId } },
        });
        if (existing) {
          existing.name = t.name ?? existing.name;
          existing.description = t.description ?? existing.description;
          await this.lessonTrRepo.save(existing);
          console.log("EXIIIIIISTING",existing)
        }
        else {
          const newTr = this.lessonTrRepo.create({
            name: t.name,
            description: t.description,
            language: lang,
            lesson,
          });
          await this.lessonTrRepo.save(newTr);
          console.log("NEWWWWWWWWWWWW",newTr)
        }
      }
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
    .leftJoinAndSelect(
      'lesson.translations',
      'tr',
      languageId ? 'tr.languageId = :languageId' : undefined,
      { languageId },
    )
    .select([
      'lesson.id',
      'lesson.order_id',
      'lesson.video_link',
      'lesson.lesson_type',        // 👈 مهم
      'tr.id',
      'tr.name',
    ])
    .where('lesson.id = :lessonId', { lessonId });

  const entity = await qb.getOne();
  if (!entity) throw new NotFoundException('Lesson not found');

  // ⛔ لو الدرس ده كويز → منستخدمش الـ content endpoint
  if (entity.lesson_type === LessonType.QUESTIONS) {
    throw new BadRequestException('This lesson is a quiz. Use quiz endpoint.');
  }

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
async getPrevAndNextInContent(lessonId: number) {
    const cur = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['topic', 'topic.content'],
      select: ['id', 'order_id'],
    });
    if (!cur) throw new NotFoundException('Lesson not found');

    const contentId = cur.topic.content.id;
    const curTopicId = cur.topic.id;
    const curOrder = cur.order_id ?? 0;

    const prev = await this.lessonRepo.createQueryBuilder('l')
      .innerJoin('l.topic', 't')
      .innerJoin('t.content', 'c')
      .where('c.id = :cid', { cid: contentId })
      .andWhere('(t.id < :tid OR (t.id = :tid AND l.order_id < :ord))',
        { tid: curTopicId, ord: curOrder })
      .orderBy('t.id', 'DESC')
      .addOrderBy('l.order_id', 'DESC')
      .addOrderBy('l.id', 'DESC')
      .getOne();

    const next = await this.lessonRepo.createQueryBuilder('l')
      .innerJoin('l.topic', 't')
      .innerJoin('t.content', 'c')
      .where('c.id = :cid', { cid: contentId })
      .andWhere('(t.id > :tid OR (t.id = :tid AND l.order_id > :ord))',
        { tid: curTopicId, ord: curOrder })
      .orderBy('t.id', 'ASC')
      .addOrderBy('l.order_id', 'ASC')
      .addOrderBy('l.id', 'ASC')
      .getOne();

    return { cur, prev, next, contentId };
  }

async getTopicsWithStatus(
    contentId: number,
    userId: number,
    params: { languageId?: number },
  ): Promise<TopicWithLessonsStatus[]> {
    // content موجود؟
    const content = await this.contentRepo.findOne({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Content not found');

    // لازم Enrollment
    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
      select: ['id'],
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this content');

    // هات التوبيكس + الدروس + الترجمات
    const qb = this.contentRepo
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.topics', 'topic')
      .leftJoinAndSelect(
        'topic.translations',
        'ttr',
        params.languageId ? 'ttr.languageId = :languageId' : undefined,
        { languageId: params.languageId },
      )
      .leftJoinAndSelect('topic.lessons', 'lesson')
      .leftJoinAndSelect(
        'lesson.translations',
        'ltr',
        params.languageId ? 'ltr.languageId = :languageId' : undefined,
        { languageId: params.languageId },
      )
      .where('content.id = :id', { id: contentId });

    const c = await qb.getOne();
    if (!c) throw new NotFoundException('Content not found');

    // كل الدروس المكتملة
    const progressRows = await this.progressRepo
      .createQueryBuilder('p')
      .select(['p.lesson_id AS lessonId'])
      .where('p.enrollment_id = :enrollId', { enrollId: enrollment.id })
      .andWhere('p.user_id = :userId', { userId })
      .getRawMany<{ lessonId: number }>();

    const completedSet = new Set(progressRows.map(r => Number(r.lessonId)));

    // ترتيب عام لكل دروس المحتوى (topicId ثم order_id ثم id)
    const allLessonsOrdered = (c.topics ?? [])
      .flatMap(t => (t.lessons ?? []).map(l => ({ t, l })))
      .sort((a, b) => {
        const ta = a.t.id, tb = b.t.id;
        if (ta !== tb) return ta - tb;
        const oa = a.l.order_id ?? 0, ob = b.l.order_id ?? 0;
        if (oa !== ob) return oa - ob;
        return a.l.id - b.l.id;
      });

    // ابني الاستجابة
    const topics: TopicWithLessonsStatus[] = (c.topics ?? []).map((t) => {
      const ttr = t.translations?.[0] ?? null;

      // رتّب دروس التوبيك محليًا (احتياطي)
      const lessonsOrdered = [...(t.lessons ?? [])].sort((a, b) => {
        const ao = a.order_id ?? 0;
        const bo = b.order_id ?? 0;
        if (ao !== bo) return ao - bo;
        return a.id - b.id;
      });

      let topicDuration = 0;

      const lessons = lessonsOrdered.map((l) => {
        const ltr = l.translations?.[0] ?? null;
        const duration = typeof l.duration === 'number' ? l.duration : 0;
        topicDuration += duration;

        const idxGlobal = allLessonsOrdered.findIndex(x => x.l.id === l.id);
        const prevGlobal = idxGlobal > 0 ? allLessonsOrdered[idxGlobal - 1].l : null;

        const isCompleted = completedSet.has(l.id);
        const prevCompleted = prevGlobal ? completedSet.has(prevGlobal.id) : true;
        const isFirstInContent = idxGlobal === 0;

        const isUnlocked = isFirstInContent ? true : prevCompleted;

        return {
          id: l.id,
          type: l.lesson_type,
          name: ltr?.name || '',
          duration,
          order: l.order_id ?? 0,
          isCompleted,
          isUnlocked,
        };
      });

      return {
        id: t.id,
        name: ttr?.name || '',
        duration: topicDuration,
        type_disc: '0 for video, 1 for quiz', // توضيح نوع الدرس
        lessons,
      };
    });

    // ترتيب التوبيكس اختياري (لو عايز تثبيت)
    topics.sort((a, b) => a.id - b.id);
    topics.forEach(t => t.lessons.sort((a, b) => a.order - b.order || a.id - b.id));

    return topics;
  }
}
