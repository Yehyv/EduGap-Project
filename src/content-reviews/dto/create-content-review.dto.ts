import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateContentReviewDto {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  review: string;
}
