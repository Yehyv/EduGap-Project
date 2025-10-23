import { Module } from '@nestjs/common';
import { LessonNotesService } from './lesson-notes.service';
import { LessonNotesController } from './lesson-notes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonNote } from './entities/lesson-note.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonNote, Lesson, User])],
  controllers: [LessonNotesController],
  providers: [LessonNotesService],
})
export class LessonNotesModule {}
