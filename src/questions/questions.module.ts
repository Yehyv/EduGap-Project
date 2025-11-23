import { forwardRef, Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionTranslation } from './entities/question-translation.entity';
import { QuestionAnswer } from './entities/question-answer.entity';
import { QuestionAnswerTranslation } from './entities/question-answer-translation.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { LessonsModule } from 'src/lessons/lessons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuestionTranslation,
      QuestionAnswer,
      QuestionAnswerTranslation,
      Lesson,
      Language,
      Enrollment,
      LessonProgress,
    ]),
    forwardRef(() => LessonsModule),
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
