import { Module } from '@nestjs/common';
import { LessonCommentsService } from './lesson-comments.service';
import { LessonCommentsController } from './lesson-comments.controller';

@Module({
  controllers: [LessonCommentsController],
  providers: [LessonCommentsService],
})
export class LessonCommentsModule {}
