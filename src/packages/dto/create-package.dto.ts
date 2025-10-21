import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsNumber,
} from 'class-validator';

export class PackageTranslationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  learning_outcoms?: string;

  @IsNumber()
  languageId: number;
}

export class CreatePackageDto {
  @IsString()
  @IsOptional()
  image?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PackageTranslationDto)
  translations: PackageTranslationDto[];

  @IsNumber()
  @IsOptional()
  created_by?: number;

  @IsNumber()
  @IsOptional()
  is_active?: number; // 0/1
}
