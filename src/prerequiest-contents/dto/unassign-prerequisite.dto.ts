import { IsInt, Min } from 'class-validator';

export class UnassignPrerequisiteDto {
  @IsInt()
  @Min(1)
  prerequisiteContentId: number;
}
