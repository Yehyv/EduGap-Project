// src/lesson-materials/dto/lesson-material-translation.dto.ts
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class LessonMaterialTranslationDto {
  @IsInt()
  @Type(() => Number)
  languageId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
const safeJson = (s: string): unknown => {
  try {
    return JSON.parse(s) as unknown;
  } catch {
    return [];
  }
};

// helper: طبّع عنصر واحد إلى TranslationDto (مع حراسة أنواع)
type RawTrans = {
  languageId?: unknown;
  title?: unknown;
  description?: unknown;
};
const normalizeOne = (raw: unknown): LessonMaterialTranslationDto | null => {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as RawTrans;

  const langId = Number(obj.languageId);
  const title =
    typeof obj.title === 'string' ? obj.title : String(obj.title ?? '');

  if (!Number.isFinite(langId) || !title) return null;

  const description =
    obj.description === undefined ? undefined : String(obj.description);

  return { languageId: langId, title, description };
};
export class CreateLessonMaterialDto {
  @IsInt()
  @Type(() => Number)
  lessonId: number;

  @IsInt()
  @Type(() => Number)
  materialTypeId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  contentId?: number;

  @IsOptional()
  @IsString()
  file?: string; // لو بتخزن URL/Key

  @IsOptional()
  @IsIn([0, 1])
  @Type(() => Number)
  is_active?: number; // default 1

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonMaterialTranslationDto)
  @Transform(({ value }): LessonMaterialTranslationDto[] => {
    const src: unknown =
      typeof value === 'string' ? safeJson(value) : (value as unknown);

    const arr: unknown[] = Array.isArray(src) ? src : [];

    const out: LessonMaterialTranslationDto[] = [];
    for (const item of arr) {
      const t = normalizeOne(item);
      if (t) out.push(t);
    }
    return out; // ✅ مش any
  })
  translations: LessonMaterialTranslationDto[];
}
