import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReverseContractPaymentDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsDateString()
  reversalDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
