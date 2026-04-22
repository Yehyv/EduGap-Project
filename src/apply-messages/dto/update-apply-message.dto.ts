import { PartialType } from '@nestjs/mapped-types';
import { CreateApplyMessageDto } from './create-apply-message.dto';

export class UpdateApplyMessageDto extends PartialType(CreateApplyMessageDto) {}
