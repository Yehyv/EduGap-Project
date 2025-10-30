// create-prerequiest-content.dto.ts
import { IsEnum, IsInt, Min } from 'class-validator';
import { PrerequisiteType } from '../entities/prerequiest-content.entity';
export class CreatePrerequiestContentDto {
  @IsInt()
  @Min(1)
  preId: number;

  @IsEnum(PrerequisiteType)
  type: PrerequisiteType; // 0 optional, 1 mandatory
}
