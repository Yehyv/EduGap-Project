import { Module } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategoriesController } from './course-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCategory } from './entities/course-category.entity';
import { CourseCategoryTranslation } from './entities/course-category-translation.entity';
import { Course } from 'src/courses/entities/course.entity';
import { Language } from 'src/languages/entities/language.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseCategory,
      CourseCategoryTranslation,
      Course,
      Language,
    ]),
  ],
  controllers: [CourseCategoriesController],
  providers: [CourseCategoriesService],
})
export class CourseCategoriesModule {}
