import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedContentDto } from './create-saved-content.dto';

export class UpdateSavedContentDto extends PartialType(CreateSavedContentDto) {}
