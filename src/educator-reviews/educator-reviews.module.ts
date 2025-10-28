import { Module } from '@nestjs/common';
import { EducatorReviewsService } from './educator-reviews.service';
import { EducatorReviewsController } from './educator-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducatorReview } from './entities/educator-review.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { Content } from 'src/contents/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EducatorReview,
      Educator,
      Content,
      User,
      Enrollment,
    ]),
  ],
  controllers: [EducatorReviewsController],
  providers: [EducatorReviewsService],
})
export class EducatorReviewsModule {}
