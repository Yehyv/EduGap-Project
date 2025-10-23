import { Module } from '@nestjs/common';
import { LessonCommentsService } from './lesson-comments.service';
import { LessonCommentsController } from './lesson-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonComment } from './entities/lesson-comment.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonComment, Lesson, User])],
  controllers: [LessonCommentsController],
  providers: [LessonCommentsService],
})
export class LessonCommentsModule {}
