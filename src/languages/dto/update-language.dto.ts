// src/languages/dto/update-language.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLanguageDto } from './create-language.dto';
import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateLanguageDto extends PartialType(CreateLanguageDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
