import { Module } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { RegionTranslation } from './entities/region-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { City } from 'src/cities/entities/city.entity';
import { Institute } from 'src/institutes/entities/institute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      RegionTranslation,
      Language,
      City,
      Institute,
    ]),
  ],
  controllers: [RegionsController],
  providers: [RegionsService],
})
export class RegionsModule {}
