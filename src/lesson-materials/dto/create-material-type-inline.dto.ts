// src/lesson-materials/dto/create-material-type-inline.dto.ts
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMaterialTypeInlineDto {
  @IsString()
  @IsNotEmpty()
  type_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  type_icon: string;

  @IsOptional()
  @IsInt()
  @IsIn([0, 1])
  is_active?: number; // default 1
}
