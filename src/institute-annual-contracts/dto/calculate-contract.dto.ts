import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { DiscountType } from '../entities/institute-annual-contract.entity';

export class CalculateContractDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxStudentsAllowed: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerStudent: number;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  administrativeFees?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number;
}
