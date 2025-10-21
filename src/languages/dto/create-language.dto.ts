// src/languages/dto/create-language.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // API: boolean (هنحوّلها لــ 0/1 في السيرفس)
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean; // جديدة: لو عايز تتحكم في التفعيل من الإنشاء
}
