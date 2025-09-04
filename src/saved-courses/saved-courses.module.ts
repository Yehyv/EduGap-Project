import { Module } from '@nestjs/common';
import { SavedCoursesService } from './saved-courses.service';
import { SavedCoursesController } from './saved-courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedCourse } from './entities/saved-course.entity';
import { User } from 'src/users/entities/user.entity';
import { Course } from 'src/courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavedCourse, User, Course])],
  controllers: [SavedCoursesController],
  providers: [SavedCoursesService],
})
export class SavedCoursesModule {}
