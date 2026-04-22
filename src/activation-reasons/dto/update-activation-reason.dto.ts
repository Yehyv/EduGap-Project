import { PartialType } from '@nestjs/mapped-types';
import { CreateActivationReasonDto } from './create-activation-reason.dto';

export class UpdateActivationReasonDto extends PartialType(
  CreateActivationReasonDto,
) {}
