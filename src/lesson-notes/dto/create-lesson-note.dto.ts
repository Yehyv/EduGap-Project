import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateLessonNoteDto {
  @IsString()
  @IsNotEmpty()
  notes: string;
}
