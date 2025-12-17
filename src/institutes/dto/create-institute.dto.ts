import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
export class InstituteTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @Type(() => Number)
  @IsNumber()
  languageId: number;

  @IsString()
  @IsNotEmpty()
  contactPersopnName: string;

  @IsString()
  @IsNotEmpty()
  contactPersonPostion: string;
}
export class CreateInstituteDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone_key: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @Type(() => Number)
  @IsNumber()
  regionId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstituteTranslationDto)
  translations: InstituteTranslationDto[];
}
