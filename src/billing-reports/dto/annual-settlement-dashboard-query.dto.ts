import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AnnualSettlementDashboardQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(2000)
  academicYear?: number;
}