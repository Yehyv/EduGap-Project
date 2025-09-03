import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonTranslation } from './entities/lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Student } from 'src/students/entities/student.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      Language,
      LessonTranslation,
      Topic,
      Student,
      LessonProgress,
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
