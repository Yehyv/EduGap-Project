import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedLessonDto } from './create-saved-lesson.dto';

export class UpdateSavedLessonDto extends PartialType(CreateSavedLessonDto) {}
