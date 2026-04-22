import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ActivationReasonType } from '../entities/activation-reason.entity';

export class CreateActivationReasonDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsEnum(ActivationReasonType)
  type: ActivationReasonType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn([0, 1])
  is_active?: number;
}
