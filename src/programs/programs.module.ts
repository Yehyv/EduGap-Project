import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Course } from 'src/courses/entities/course.entity';
import { ProgramTranslation } from './entities/program-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { ProgramCourse } from './entities/program-course.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { InstitutePrograms } from 'src/institutes/entities/institute-programs.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      ProgramTranslation,
      Language,
      Course,
      Institute,
      ProgramCourse,
      InstituteProgramCourse,
      InstitutePrograms,
      SystemUser,
    ]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
