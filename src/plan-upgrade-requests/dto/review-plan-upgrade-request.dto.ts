import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApprovePlanUpgradeRequestDto {
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class RejectPlanUpgradeRequestDto {
  @IsString()
  @IsNotEmpty()
  reviewNotes: string;
}
