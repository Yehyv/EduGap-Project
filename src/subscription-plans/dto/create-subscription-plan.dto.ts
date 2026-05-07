import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  plan_name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  min_students: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_students: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  default_price_per_student: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  default_installments_count: number;

  @IsOptional()
  @IsString()
  description?: string;
}
