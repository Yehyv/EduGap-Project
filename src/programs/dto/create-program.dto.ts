import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
export class ProgramTranslationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  logo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramTranslationDto)
  translations: ProgramTranslationDto[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  instituteIds: number[];
}
