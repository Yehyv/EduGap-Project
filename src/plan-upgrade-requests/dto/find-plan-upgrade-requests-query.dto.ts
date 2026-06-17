import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PlanUpgradeRequestStatus } from '../entities/plan-upgrade-request.entity';

export class FindPlanUpgradeRequestsQueryDto {
  @IsOptional()
  @IsEnum(PlanUpgradeRequestStatus)
  status?: PlanUpgradeRequestStatus;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  instituteId?: number;

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
