import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class OverdueInstallmentsQueryDto {
  @IsOptional()
  @IsDateString()
  asOfDate?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  planId?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  overdueDays?: number;

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
