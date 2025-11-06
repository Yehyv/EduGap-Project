import { forwardRef, Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonsModule } from 'src/lessons/lessons.module';
import { Content } from 'src/contents/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonProgress, Lesson, Enrollment, Content]),
    forwardRef(() => LessonsModule),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
