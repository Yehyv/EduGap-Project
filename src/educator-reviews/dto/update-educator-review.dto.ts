import { PartialType } from '@nestjs/mapped-types';
import { CreateEducatorReviewDto } from './create-educator-review.dto';

export class UpdateEducatorReviewDto extends PartialType(
  CreateEducatorReviewDto,
) {}
