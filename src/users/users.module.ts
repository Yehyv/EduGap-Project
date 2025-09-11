import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Student } from 'src/students/entities/student.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { SavedContent } from 'src/saved-courses/entities/saved-content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Student,
      Institute,
      Educator,
      Enrollment,
      SavedContent,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
