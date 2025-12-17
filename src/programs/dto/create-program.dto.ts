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

  @Type(() => Number)
  @IsNumber()
  languageId: number;
}

export class CreateProgramDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramTranslationDto)
  translations: ProgramTranslationDto[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  instituteIds: number[];
}
