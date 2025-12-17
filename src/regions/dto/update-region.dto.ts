import { PartialType } from '@nestjs/mapped-types';
import { CreateRegionDto, RegionTranslationDto } from './create-region.dto';

export class UpdateRegionDto extends PartialType(CreateRegionDto) {}
export class UpdateRegionTranslationDto extends PartialType(
  RegionTranslationDto,
) {}
