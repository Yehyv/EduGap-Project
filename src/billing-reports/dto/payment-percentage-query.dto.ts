import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaymentPercentageQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(2000)
  academicYear?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  planId?: number;

  @IsOptional()
  @IsString()
  settlementStatus?: string;

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
