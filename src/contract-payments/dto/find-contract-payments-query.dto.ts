import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  PaymentMethod,
  PaymentStatus,
} from '../entities/contract-payment.entity';

export class FindContractPaymentsQueryDto {
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

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

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
