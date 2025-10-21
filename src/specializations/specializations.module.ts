import { Module } from '@nestjs/common';
import { SpecializationsService } from './specializations.service';
import { SpecializationsController } from './specializations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialization } from './entities/specialization.entity';
import { SpecializationTranslation } from './entities/specialization-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Specialization, SpecializationTranslation]),
  ],
  controllers: [SpecializationsController],
  providers: [SpecializationsService],
})
export class SpecializationsModule {}
