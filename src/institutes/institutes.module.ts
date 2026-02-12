import { Module } from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { InstitutesController } from './institutes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institute } from './entities/institute.entity';
import { instituteTranslation } from './entities/institute-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Program } from 'src/programs/entities/program.entity';
import { User } from 'src/users/entities/user.entity';
import { InstitutePrograms } from './entities/institute-programs.entity';
import { InstituteProgramCourse } from './entities/institute-program-course.entity';
import { Region } from 'src/regions/entities/region.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Institute,
      instituteTranslation,
      InstitutePrograms,
      InstituteProgramCourse,
      Language,
      Program,
      User,
      Region,
      SystemUser,
    ]),
  ],
  controllers: [InstitutesController],
  providers: [InstitutesService],
})
export class InstitutesModule {}
