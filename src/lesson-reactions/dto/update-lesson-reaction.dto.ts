import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonReactionDto } from './create-lesson-reaction.dto';

export class UpdateLessonReactionDto extends PartialType(
  CreateLessonReactionDto,
) {}
