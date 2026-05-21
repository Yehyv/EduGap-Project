import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../entities/contract-payment.entity';

export class UploadInstitutePaymentProofDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  installmentId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  receiptNo?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}