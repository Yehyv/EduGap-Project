import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CityTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}
export class CreateCityDto {
  @IsNumber()
  @IsOptional()
  isActive: number; // 0/1

  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CityTranslationDto)
  translations: CityTranslationDto[];
}
