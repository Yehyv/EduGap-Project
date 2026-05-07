import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class GenerateInstallmentsDto {
  @IsOptional()
  @IsDateString()
  firstDueDate?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  intervalMonths?: number;

  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
