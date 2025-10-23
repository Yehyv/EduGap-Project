import { IsInt, IsOptional } from 'class-validator';

export class UnsaveLessonDto {
  @IsInt()
  lessonId: number;

  @IsOptional()
  @IsInt()
  contentId?: number;
}