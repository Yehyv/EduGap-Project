// src/enrollments/dto/create-enrollment.dto.ts
import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';

export class CreateEnrollmentDto {
  @IsIn([0, 1])
  @IsOptional()
  status?: 0 | 1;
}
export class RateEnrollmentDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number; // 1..5
}
