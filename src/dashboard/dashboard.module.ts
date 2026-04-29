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
import { Certificate } from 'src/certificates/entities/certificate.entity';
import { PackageEnrollment } from 'src/package-enrollments/entities/package-enrollment.entity';
import { Institute } from 'src/institutes/entities/institute.entity';

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
      Certificate,
      PackageEnrollment,
      Institute,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
