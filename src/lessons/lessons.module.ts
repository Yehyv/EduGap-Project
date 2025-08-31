import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonTranslation } from './entities/lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { Language } from 'src/languages/entities/language.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Language, LessonTranslation, Topic]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
