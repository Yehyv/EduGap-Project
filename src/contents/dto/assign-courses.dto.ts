import { IsArray, IsNumber } from 'class-validator';

export class AssignCoursesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  courseIds: number[];
}
