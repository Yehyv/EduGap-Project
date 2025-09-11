import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { User } from 'src/users/entities/user.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { Content } from 'src/contents/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, User, Content, LessonProgress]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
