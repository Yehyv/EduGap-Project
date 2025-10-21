import { Module } from '@nestjs/common';
import { ContentReviewsService } from './content-reviews.service';
import { ContentReviewsController } from './content-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentReview } from './entities/content-review.entity';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentReview,
      User,
      Content,
      CourseContent,
      InstituteProgramCourse,
    ]),
  ],
  controllers: [ContentReviewsController],
  providers: [ContentReviewsService],
})
export class ContentReviewsModule {}
