import {
  IsInt,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEducatorReviewDto {
  @IsInt()
  contentId: number;

  @IsInt()
  educatorId: number;

  // ✅ Float 1..5 (تقدر تغيّر maxDecimalPlaces حسب رغبتك)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;
}
