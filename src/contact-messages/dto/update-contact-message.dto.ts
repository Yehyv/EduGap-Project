import { PartialType } from '@nestjs/mapped-types';
import { CreateContactMessageDto } from './create-contact-message.dto';

export class UpdateContactMessageDto extends PartialType(CreateContactMessageDto) {}
