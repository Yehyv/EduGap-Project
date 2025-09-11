import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseTranslation } from './entities/course-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Student } from 'src/students/entities/student.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseTranslation,
      Language,
      Program,
      Content,
      Student,
      Enrollment,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
