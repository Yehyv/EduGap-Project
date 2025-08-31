import { Module } from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { InstitutesController } from './institutes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institute } from './entities/institute.entity';
import { instituteTranslation } from './entities/institute-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Program } from 'src/programs/entities/program.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Institute,
      instituteTranslation,
      Language,
      Program,
      User,
    ]),
  ],
  controllers: [InstitutesController],
  providers: [InstitutesService],
})
export class InstitutesModule {}
