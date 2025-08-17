import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto, CourseTranslationDto } from './create-course.dto';

export class UpdateCourseTranslationDto extends PartialType(
  CourseTranslationDto,
) {}
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
