import { Module } from '@nestjs/common';
import { SavedCoursesService } from './saved-course.service';
import { SavedContentsController } from './saved-course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedCourse } from './entities/saved-course.entity';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedCourse, User, Course])],
  controllers: [SavedContentsController],
  providers: [SavedCoursesService],
})
export class SavedCoursesModule {}
