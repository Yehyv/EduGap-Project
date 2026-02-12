import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseTranslation } from './entities/course-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { ProgramCourse } from 'src/programs/entities/program-course.entity';
import { InstitutePrograms } from 'src/institutes/entities/institute-programs.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { SavedCourse } from 'src/saved-courses/entities/saved-course.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseTranslation,
      Language,
      Program,
      Content,
      Enrollment,
      InstituteProgramCourse,
      ProgramCourse,
      InstitutePrograms,
      LessonProgress,
      SavedCourse,
      SystemUser,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
