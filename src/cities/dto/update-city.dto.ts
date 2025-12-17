import { PartialType } from '@nestjs/mapped-types';
import { CreateCityDto, CityTranslationDto } from './create-city.dto';

export class UpdateCityDto extends PartialType(CreateCityDto) {}
export class UpdateCityTranslationDto extends PartialType(CityTranslationDto) {}
