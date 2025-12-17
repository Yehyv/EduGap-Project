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

export class RegionTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}
export class CreateRegionDto {
  @IsNumber()
  @IsOptional()
  isActive: number; // 0/1

  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RegionTranslationDto)
  translations: RegionTranslationDto[];
}
