import { PartialType } from '@nestjs/mapped-types';
import {
  CreateActivationReasonDto,
  ActivationReasonTranslationDto,
} from './create-activation-reason.dto';

export class UpdateActivationReasonDto extends PartialType(
  CreateActivationReasonDto,
) {}

export class UpdateActivationReasonTranslationDto extends PartialType(
  ActivationReasonTranslationDto,
) {}