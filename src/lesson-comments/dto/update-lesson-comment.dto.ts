import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonCommentDto } from './create-lesson-comment.dto';

export class UpdateLessonCommentDto extends PartialType(
  CreateLessonCommentDto,
) {}
