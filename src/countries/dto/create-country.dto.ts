import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CountryTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}
export class CreateCountryDto {
  @IsNumber()
  @IsOptional()
  @IsIn([0, 1])
  isActive?: number; // 0/1

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CountryTranslationDto)
  translations: CountryTranslationDto[];
}
