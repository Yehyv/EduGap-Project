import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonCommentDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}
