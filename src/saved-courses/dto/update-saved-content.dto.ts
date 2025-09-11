import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedContentDto } from './create-saved-content.dto';

export class UpdateSavedCourseDto extends PartialType(CreateSavedContentDto) {}
