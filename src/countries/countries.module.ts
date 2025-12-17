import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { CountryTranslation } from './entities/country-translation.entity';
import { Language } from 'src/languages/entities/language.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country, CountryTranslation, Language])],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
