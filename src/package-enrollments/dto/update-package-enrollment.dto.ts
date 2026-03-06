import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageEnrollmentDto } from './create-package-enrollment.dto';

export class UpdatePackageEnrollmentDto extends PartialType(
  CreatePackageEnrollmentDto,
) {}
