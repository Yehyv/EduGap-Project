import { Module } from '@nestjs/common';
import { SavedLessonService } from './saved-lesson.service';
import { SavedLessonController } from './saved-lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedLesson } from './entities/saved-lesson.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedLesson, Content, Lesson])],
  controllers: [SavedLessonController],
  providers: [SavedLessonService],
})
export class SavedLessonModule {}
