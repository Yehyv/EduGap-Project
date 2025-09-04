import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedCourseDto } from './create-saved-course.dto';

export class UpdateSavedCourseDto extends PartialType(CreateSavedCourseDto) {}
