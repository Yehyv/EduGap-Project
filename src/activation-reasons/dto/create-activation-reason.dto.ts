import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ActivationReasonType } from '../entities/activation-reason.entity';

export class ActivationReasonTranslationDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  languageId: number;
}

export class CreateActivationReasonDto {
  @IsEnum(ActivationReasonType)
  type: ActivationReasonType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn([0, 1])
  is_active?: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ActivationReasonTranslationDto)
  translations: ActivationReasonTranslationDto[];
}