import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonMaterialDto } from './create-lesson-material.dto';

export class UpdateLessonMaterialDto extends PartialType(
  CreateLessonMaterialDto,
) {}
