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
interface topicRow {
  topic_id: number;
  topic_order_id: number;
  topic_is_active: number;
  topic_translation_name: string;
  topic_translation_description: string;
  topic_content_id: number;
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
  async create(dto: CreateTopicDto) {
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
    });
    const saved = await this.topicRepo.save(topic);

    await this.createOrReplaceTranslations(saved, dto.translations);

    // رجّع الموضوع مع ترجماته
    return this.findOne(saved.id);
  }

  /** عرض كل التوبيكس (اختياري: فلترة باللغة وبالكونتنت) */
  async findAll(languageId?: number, contentId?: number) {
    const query = this.topicRepo
      .createQueryBuilder('topic')
      .leftJoin('topic.translations', 'translation', languageId ? 'translation.languageId = :languageId' : undefined, { languageId})
      .leftJoin('translation.language', 'language')
      .leftJoin('topic.content', 'content')
      .where('content.id = :contentId', {  contentId  })
      .select([
        'topic.id',
        'topic.order_id',
        'topic.is_active',
        'translation.name',
        'translation.description',
        'content.id',
      ]);
    const rows = await query.getRawMany<topicRow>();
    if( !rows ) throw new NotFoundException('topic not found');
    return rows.map((r) => ({
      id: r.topic_id,
      order_id: r.topic_order_id,
      is_active: r.topic_is_active,
      name: r.topic_translation_name,
      description: r.topic_translation_description,
      contentId : r.topic_content_id      
    }))

  }

  /** عرض توبيك واحد */
  async findOne(id: number, languageId?: number) {
    // const query = this.topicRepo
    //   .createQueryBuilder('topic')
    //   .leftJoin('topic.translations', 'translation', languageId ? 'translation.language_id = :languageId' : undefined, { languageId})
    //   .leftJoin('translation.language', 'language')
    //   .leftJoin('topic.content', 'content')
    //   .where('content.id = :contentId', {  contentId  })
    //   .select([
    //     'topic.id',
    //     'topic.order_id',
    //     'topic.is_active',
    //     'translation.name',
    //     'translation.description',
    //     'content.id',
    //   ]);
  }

  /** تحديث توبيك: تغيير content/order/is_active + replace translations (اختياري) */
  async update(id: number, dto: UpdateTopicDto) {
    const existing = await this.topicRepo.findOne({
      where: { id },
      relations: ['content', 'translations'],
    });
    if (!existing) throw new NotFoundException('Topic not found');

    // تغيير الكونتنت لو اتبعت
    if (dto.contentId && dto.contentId !== existing.content?.id) {
      const newContent = await this.contentRepo.findOne({
        where: { id: dto.contentId },
      });
      if (!newContent) throw new NotFoundException('Content not found');
      existing.content = newContent;

      // لو مفيش orderId مبعوت، نحافظ على الترتيب النسبي — أو نحسب ترتيب جديد
      if (dto.orderId === undefined) {
        existing.order_id = await this.getNextOrderForContent(newContent.id);
      }
    }

    if (dto.orderId !== undefined) existing.order_id = dto.orderId;
    if (dto.isActive !== undefined) existing.is_active = dto.isActive;

    // replace translations لو مبعوتة
    if (dto.translations) {
      await this.topicTrRepo.delete({ topic: { id } });
      await this.createOrReplaceTranslations(existing, dto.translations);
    }

    await this.topicRepo.save(existing);
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
