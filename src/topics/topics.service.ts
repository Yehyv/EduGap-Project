import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Repository } from 'typeorm';
import { TopicTranslation } from './entities/topic-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Content } from 'src/contents/entities/content.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(TopicTranslation)
    private topicTranslationRepository: Repository<TopicTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}
  async create(createTopicDto: CreateTopicDto, userInstituteId: number) {
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('content.id = :contentId', { contentId: createTopicDto.contentId })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!content) {
      throw new Error(`Content not found for this institute`);
    }

    const topic = this.topicRepository.create({ content });
    const savedTopic = await this.topicRepository.save(topic);

    const translations = await Promise.all(
      createTopicDto.translations.map(async (translation) => {
        const language = await this.languageRepository.findOne({
          where: { id: translation.languageId },
        });
        if (!language) {
          throw new Error(
            `Language with ID ${translation.languageId} not found`,
          );
        }
        const topicTranslation = this.topicTranslationRepository.create({
          name: translation.name,
          description: translation.description,
          topic: savedTopic,
          language,
        });
        return this.topicTranslationRepository.save(topicTranslation);
      }),
    );

    return { ...savedTopic, translations };
  }

  async findAll(languageId?: number, userInstituteId?: number) {
    const query = this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('topic.translations', 'translation')
      .where('institute.id = :instituteId', { instituteId: userInstituteId });

    if (languageId) {
      query.andWhere('translation.languageId = :languageId', { languageId });
    }

    return query.getMany();
  }

  async findOne(id: number, userInstituteId: number, languageId?: number) {
    const query = this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('topic.translations', 'translation')
      .where('topic.id = :id', { id })
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
    updateTopicDto: UpdateTopicDto,
    userInstituteId: number,
  ): Promise<Topic> {
    const topic = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('topic.translations', 'translations')
      .leftJoinAndSelect('translations.language', 'language')
      .where('topic.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!topic)
      throw new NotFoundException('Topic not found for this institute');

    if (updateTopicDto.contentId) {
      const content = await this.contentRepository
        .createQueryBuilder('content')
        .leftJoin('content.courses', 'course')
        .leftJoin('course.programs', 'program')
        .leftJoin('program.institutes', 'institute')
        .where('content.id = :contentId', {
          contentId: updateTopicDto.contentId,
        })
        .andWhere('institute.id = :instituteId', {
          instituteId: userInstituteId,
        })
        .getOne();

      if (!content)
        throw new NotFoundException('Content not found for this institute');
      topic.content = content;
    }

    if (updateTopicDto.translations) {
      await this.topicTranslationRepository.delete({ topic: { id } });

      const translations = await Promise.all(
        updateTopicDto.translations.map(async (translation) => {
          const language = await this.languageRepository.findOne({
            where: { id: translation.languageId },
          });
          if (!language)
            throw new NotFoundException(
              `Language with ID ${translation.languageId} not found`,
            );

          const topicTranslation = this.topicTranslationRepository.create({
            name: translation.name,
            description: translation.description,
            topic,
            language,
          });
          return this.topicTranslationRepository.save(topicTranslation);
        }),
      );
      topic.translations = translations;
    }

    return this.topicRepository.save(topic);
  }

  async remove(id: number, userInstituteId: number): Promise<void> {
    const topic = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('topic.id = :id', { id })
      .andWhere('institute.id = :instituteId', { instituteId: userInstituteId })
      .getOne();

    if (!topic)
      throw new NotFoundException('Topic not found for this institute');

    await this.topicRepository.softDelete(id);
  }
}
