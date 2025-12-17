import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { CityTranslation } from './entities/city-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Country } from 'src/countries/entities/country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([City, CityTranslation, Language, Country]),
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
})
export class CitiesModule {}
