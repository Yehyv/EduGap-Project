import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { ContentTranslation } from './entities/content-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Course } from 'src/courses/entities/course.entity';
import { ContentCategory } from 'src/course-categories/entities/content-category.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { ContentDetailsService } from './content-details.service';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { Package } from 'src/packages/entities/package.entity';
import { PackageContent } from 'src/packages/entities/package-content.entity';
import { ContentReview } from 'src/content-reviews/entities/content-review.entity';
import { PrerequisiteContent } from 'src/prerequiest-contents/entities/prerequiest-content.entity';
import { SavedContent } from 'src/saved-contents/entities/saved-content.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { Progress } from 'src/progress/entities/progress.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content,
      ContentTranslation,
      Language,
      Course,
      ContentCategory,
      Educator,
      Enrollment,
      CourseContent,
      Package,
      PackageContent,
      Educator,
      ContentReview,
      Enrollment,
      PrerequisiteContent,
      SavedContent,
      Lesson,
      LessonProgress,
      Lesson,
      SystemUser,
    ]),
    EnrollmentsModule,
  ],
  controllers: [ContentsController],
  providers: [ContentsService, ContentDetailsService],
  exports: [ContentsService],
})
export class ContentsModule {}
