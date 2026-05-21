import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class YearlyRevenueQueryDto {
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
}
