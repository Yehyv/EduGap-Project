import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedPackageDto } from './create-saved-package.dto';

export class UpdateSavedPackageDto extends PartialType(CreateSavedPackageDto) {}
