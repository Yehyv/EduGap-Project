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
import { DiscountType } from '../entities/institute-annual-contract.entity';

export class CreateInstituteAnnualContractDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  instituteId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  planId: number;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  academicYear: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudentsAllowed?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerStudent?: number;

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

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  installmentsCount?: number;

  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
