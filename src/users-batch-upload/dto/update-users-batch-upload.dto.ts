import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersBatchUploadDto } from './create-users-batch-upload.dto';

export class UpdateUsersBatchUploadDto extends PartialType(
  CreateUsersBatchUploadDto,
) {}
