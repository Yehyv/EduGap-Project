import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';
import { ContentTranslation } from '../entities/content-translation.entity';

export class UpdateContentTranslationDto extends PartialType(
  ContentTranslation,
) {}
export class UpdateContentDto extends PartialType(CreateContentDto) {}
