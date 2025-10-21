import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { City } from './entities/city.entity';
import { Country } from './entities/country.entity';
import { RegionTranslation } from './entities/region-translation.entity';
import { CityTranslation } from './entities/city-translation.entity';
import { CountryTranslation } from './entities/country-translation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      RegionTranslation,
      City,
      CityTranslation,
      Country,
      CountryTranslation,
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
