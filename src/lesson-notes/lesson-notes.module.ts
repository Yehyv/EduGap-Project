import { Module } from '@nestjs/common';
import { LessonNotesService } from './lesson-notes.service';
import { LessonNotesController } from './lesson-notes.controller';

@Module({
  controllers: [LessonNotesController],
  providers: [LessonNotesService],
})
export class LessonNotesModule {}
