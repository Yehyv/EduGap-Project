import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Institute } from 'src/institutes/entities/institute.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Course } from 'src/courses/entities/course.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      User,
      Institute,
      Program,
      Course,
      LessonProgress,
    ]),
    AuthModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
