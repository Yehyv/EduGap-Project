import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { Educator } from 'src/educators/entities/educator.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { SavedCourse } from 'src/saved-courses/entities/saved-course.entity';
import { UserOtp } from './entities/user-otp.entity';
import { Program } from 'src/programs/entities/program.entity';
import { PasswordAction } from './entities/password-action.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Institute,
      Educator,
      Enrollment,
      SavedCourse,
      UserOtp,
      Program,
      PasswordAction,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
