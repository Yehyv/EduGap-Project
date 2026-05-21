import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanUpgradeRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestedPlanId: number;

  @IsString()
  reason: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  additionalStudentsNeeded?: number;

  @IsOptional()
  @IsString()
  message?: string;
}