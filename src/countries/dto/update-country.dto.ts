import { PartialType } from '@nestjs/mapped-types';
import { CreateCountryDto, CountryTranslationDto } from './create-country.dto';

export class UpdateCountryDto extends PartialType(CreateCountryDto) {}
export class UpdateCountryTranslationDto extends PartialType(
  CountryTranslationDto,
) {}
