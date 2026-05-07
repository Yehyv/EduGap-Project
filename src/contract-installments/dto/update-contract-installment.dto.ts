import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { InstallmentStatus } from '../entities/contract-installment.entity';

export class UpdateContractInstallmentDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  installmentAmount?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  installmentPercentage?: number;

  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
