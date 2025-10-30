import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize, IsArray } from 'class-validator';
import { CreatePrerequiestContentDto } from './create-prerequiest-content.dto';
export class AssignPrerequisitesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePrerequiestContentDto)
  items: CreatePrerequiestContentDto[];
}
