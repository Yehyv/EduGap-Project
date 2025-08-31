import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Content } from 'src/contents/entities/content.entity';
import { TopicTranslation } from './entities/topic-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Topic,
      TopicTranslation,
      Language,
      Content,
      Lesson,
    ]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService],
})
export class TopicsModule {}
