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
import { PaymentMethod } from '../entities/contract-payment.entity';

export class CreateContractPaymentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contractId: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  installmentId?: number;

  @IsDateString()
  paymentDate: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  paidAmount: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  receiptNo?: string;

  @IsOptional()
  @IsString()
  receiptFile?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
