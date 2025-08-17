import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseTranslation } from './entities/course-translation.entity';
import { Language } from 'src/languages/entities/language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseTranslation, Language])],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
