// src/lesson-reactions/dto/create-lesson-reaction.dto.ts
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLessonReactionDto {
  @IsNumber()
  @IsIn([0, 1]) // 0=dislike, 1=like
  @IsNotEmpty()
  reaction: number;
}
