/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Topic } from './entities/topic.entity';
import { TopicTranslation } from './entities/topic-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Content } from 'src/contents/entities/content.entity';

import { CreateTopicDto, TopicTranslationDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
interface topicRow {
  topic_id: number;
  topic_order_id: number;
  topic_is_active: number;
  topic_translation_name: string;
  topic_translation_description: string;
  topic_content_id: number;
  created_by_id: number;
  created_by_name: string;
}
@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
    @InjectRepository(TopicTranslation)
    private readonly topicTrRepo: Repository<TopicTranslation>,
    @InjectRepository(Language)
    private readonly langRepo: Repository<Language>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
  ) {}

  /** Helper: يحسب order_id التالي داخل نفس الـ content */
  private async getNextOrderForContent(contentId: number): Promise<number> {
    const last = await this.topicRepo
      .createQueryBuilder('t')
      .select('MAX(t.order_id)', 'max')
      .where('t.contentId = :cid', { cid: contentId })
      .getRawOne<{ max: number | null }>();
    return (last?.max ?? -1) + 1;
  }

  /** إنشاء Topic داخل Content محدد (Content مستقل تمامًا) */
  async create(dto: CreateTopicDto, userId: number) {
    const user = await this.systemUserRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const content = await this.contentRepo.findOne({
      where: { id: dto.contentId },
    });
    if (!content) throw new NotFoundException('Content not found');

    const order =
      dto.orderId ?? (await this.getNextOrderForContent(dto.contentId));

    const topic = this.topicRepo.create({
      content,
      order_id: order,
      is_active: dto.isActive ?? 1,
      createdBy: user,
    });
    const saved = await this.topicRepo.save(topic);

    await this.createOrReplaceTranslations(saved, dto.translations);

    // رجّع الموضوع مع ترجماته
    return {message: 'Topic created successfully'};
  }

  /** عرض كل التوبيكس (اختياري: فلترة باللغة وبالكونتنت) */
  async findAll(languageId?: number, contentId?: number) {
    const query = this.topicRepo
      .createQueryBuilder('topic')
      .leftJoin('topic.translations', 'translation', languageId ? 'translation.languageId = :languageId' : undefined, { languageId})
      .leftJoin('translation.language', 'language')
      .leftJoin('topic.content', 'content')
      .leftJoin('topic.createdBy', 'createdBy')
      .where('content.id = :contentId', {  contentId  })
      .select([
        'topic.id',
        'topic.order_id',
        'topic.is_active',
        'translation.name AS topic_translation_name',
        'translation.description AS topic_translation_description',
        'content.id AS topic_content_id',
        'createdBy.id AS created_by_id',
        'createdBy.name AS created_by_name',
      ]);
    const rows = await query.getRawMany<topicRow>();
    if( !rows ) throw new NotFoundException('topic not found');
    return rows.map((r) => ({
      id: r.topic_id,
      order_id: r.topic_order_id,
      is_active: r.topic_is_active,
      name: r.topic_translation_name,
      description: r.topic_translation_description,
      contentId : r.topic_content_id,
      createdBy: {
        id: r.created_by_id,
        name: r.created_by_name,
      } 
    }))

  }

  /** عرض توبيك واحد */
  async findOne(id: number, contentId?: number) {
  const query = this.topicRepo
    .createQueryBuilder('topic')
    .leftJoin('topic.translations', 'translation')
    .leftJoin('topic.content', 'content')
    .leftJoin('topic.createdBy', 'createdBy')
    .andWhere('topic.id = :id', { id });

  if (contentId !== undefined) {
    query.andWhere('content.id = :contentId', { contentId });
  }

  const rows = await query
    .select([
      'topic.id AS topic_id',
      'topic.order_id AS topic_order_id',
      'topic.is_active AS topic_is_active',
      'translation.name AS topic_translation_name',
      'translation.description AS topic_translation_description',
      'content.id AS topic_content_id',
      'createdBy.id AS created_by_id',
      'createdBy.name AS created_by_name',
    ])
    .getRawMany<topicRow>();

  if (!rows.length) {
    throw new NotFoundException('topic not found');
  }

  return {
    id: rows[0].topic_id,
    order_id: rows[0].topic_order_id,
    is_active: rows[0].topic_is_active,
    contentId: rows[0].topic_content_id,
    translations: rows.map(row => ({
      name: row.topic_translation_name,
      description: row.topic_translation_description,
    })),
  };
}




  async getTopics(contentId: number, params: { languageId?: number }) {
    // هنا نجيب التوبيكس بالترجمة + الدروس بترجمتها
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
    if (!c) throw new NotFoundException();

    const topics = (c.topics ?? []).map((t) => {
      const ttr = t.translations?.[0] ?? null;
      const lessons = (t.lessons ?? []).map((l) => {
        const ltr = l.translations?.[0] ?? null;
        const duration = typeof l.duration === 'number' ? l.duration : 0;
        return { id: l.id, name: ltr?.name || '', duration, lesson_type: l.lesson_type };
      });
      const topicDuration = lessons.reduce((s, x) => s + (x.duration || 0), 0);
      const lessonsCount = lessons.length;
      return { id: t.id, name: ttr?.name || '', duration: topicDuration, lessonsCount, lessons };
    });

    return topics;
  }

  /** تحديث توبيك: تغيير content/order/is_active + replace translations (اختياري) */
  async update(id: number, dto: UpdateTopicDto) {
    const topic = await this.topicRepo.findOne({
      where: { id },
      relations: ['content'],
    });
    console.log("TOPIIIC", topic)
    if (!topic) throw new NotFoundException('Topic not found');

    // تغيير الكونتنت لو اتبعت
    if (dto.contentId && dto.contentId !== topic.content?.id) {
      const newContent = await this.contentRepo.findOne({
        where: { id: dto.contentId },
      });
      if (!newContent) throw new NotFoundException('Content not found');
      topic.content = newContent;

      // لو مفيش orderId مبعوت، نحافظ على الترتيب النسبي — أو نحسب ترتيب جديد
      if (dto.orderId === undefined) {
        topic.order_id = await this.getNextOrderForContent(newContent.id);
      }
    }

    if (dto.orderId !== undefined) topic.order_id = dto.orderId;
    if (dto.isActive !== undefined) topic.is_active = dto.isActive;

    if(dto.translations?.length) {
      for (const t of dto.translations) {
        const lang = await this.langRepo.findOne({
          where: { id: t.languageId}
        });
        if (!lang) throw new NotFoundException(`Language ${t.languageId} not found`);
        const existing = await this.topicTrRepo.findOne({ 
          where: { topic: {id}, language: { id: t.languageId } },
        });
        if (existing) {
          existing.name = t.name ?? existing.name;
          existing.description = t.description ?? existing.description;
          await this.topicTrRepo.save(existing);
          console.log("EXIIIIIISTING",existing)
        }
        else {
          const newTr = this.topicTrRepo.create({
            name: t.name,
            description: t.description,
            language: lang,
            topic,
          });
          await this.topicTrRepo.save(newTr);
          console.log("NEWWWWWWWWWWWW",newTr)
        }
      }
    }

    await this.topicRepo.save(topic);
    return this.findOne(id);
  }

  /** حذف (Soft) */
  async remove(id: number): Promise<void> {
    const found = await this.topicRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Topic not found');
    await this.topicRepo.softDelete(id);
  }

  /** helper لإنشاء/استبدال الترجمات */
  private async createOrReplaceTranslations(
    topic: Topic,
    translations: TopicTranslationDto[],
  ) {
    for (const t of translations) {
      const lang = await this.langRepo.findOne({ where: { id: t.languageId } });
      if (!lang) {
        throw new NotFoundException(
          `Language with ID ${t.languageId} not found`,
        );
      }
      const tr = this.topicTrRepo.create({
        name: t.name,
        description: t.description,
        topic,
        language: lang,
      });
      await this.topicTrRepo.save(tr);
    }
  }
}
