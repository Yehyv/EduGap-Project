import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './entities/program.entity';
import { Course } from 'src/courses/entities/course.entity';
import { ProgramTranslation } from './entities/program-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Institute } from 'src/institutes/entities/institute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Program,
      ProgramTranslation,
      Language,
      Course,
      Institute,
    ]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService],
})
export class ProgramsModule {}
