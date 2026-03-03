import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      Lesson,
      LessonProgress,
      Content,
      User,
      InstituteProgramCourse,
      Lesson,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
