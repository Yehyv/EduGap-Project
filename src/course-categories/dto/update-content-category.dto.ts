import { PartialType } from '@nestjs/mapped-types';
import {
  CreateContentCategoryDto,
  CreateContentCategoryTranslationDto,
} from './create-content-category.dto';
export class UpdateContentCategoryDto extends PartialType(
  CreateContentCategoryDto,
) {}
export class UpdateContentCategoryTranslation extends PartialType(
  CreateContentCategoryTranslationDto,
) {}
