import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { InstallmentStatus } from '../entities/contract-installment.entity';

export class FindContractInstallmentsQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  contractId?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  instituteId?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsEnum(InstallmentStatus)
  status?: InstallmentStatus;

  @IsOptional()
  @IsDateString()
  dueFrom?: string;

  @IsOptional()
  @IsDateString()
  dueTo?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?:
    | 'installmentNo'
    | 'dueDate'
    | 'amount'
    | 'paidAmount'
    | 'remainingAmount'
    | 'status';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
