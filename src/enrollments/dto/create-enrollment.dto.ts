// src/enrollments/dto/create-enrollment.dto.ts
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

export class CreateEnrollmentDto {
  @IsOptional()
  @IsEnum([0, 1], {
    message: 'status must be 0 or 1 (0=in progress, 1=completed)',
  })
  status?: number;
}
export class RateEnrollmentDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number; // 1..5
}
