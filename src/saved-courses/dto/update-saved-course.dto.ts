import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedCoursetDto } from './create-saved-course.dto';
export class UpdateSavedCourseDto extends PartialType(CreateSavedCoursetDto) {}
