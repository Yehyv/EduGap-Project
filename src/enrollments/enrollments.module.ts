import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { User } from 'src/users/entities/user.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { Content } from 'src/contents/entities/content.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { PrerequisiteContent } from 'src/prerequiest-contents/entities/prerequiest-content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Enrollment,
      User,
      Content,
      LessonProgress,
      CourseContent,
      InstituteProgramCourse,
      PrerequisiteContent,
    ]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
