import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonTranslation } from './entities/lesson-translation.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { Language } from 'src/languages/entities/language.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { LessonComment } from 'src/lesson-comments/entities/lesson-comment.entity';
import { LessonMaterial } from 'src/lesson-materials/entities/lesson-material.entity';
import { LessonNote } from 'src/lesson-notes/entities/lesson-note.entity';
import { LessonReaction } from 'src/lesson-reactions/entities/lesson-reaction.entity';
import { SavedLesson } from 'src/saved-lesson/entities/saved-lesson.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Progress } from 'src/progress/entities/progress.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonUnlockGuard } from './lesson-unlock.guard';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      Language,
      LessonTranslation,
      Topic,
      LessonProgress,
      LessonComment,
      LessonMaterial,
      LessonNote,
      LessonReaction,
      SavedLesson,
      Content,
      Progress,
      Enrollment,
      SystemUser,
    ]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService, LessonUnlockGuard],
  exports: [LessonsService],
})
export class LessonsModule {}
