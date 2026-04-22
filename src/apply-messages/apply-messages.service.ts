import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplyMessage } from './entities/apply-message.entity';
import { CreateApplyMessageDto } from './dto/create-apply-message.dto';

@Injectable()
export class ApplyMessagesService {
  constructor(
    @InjectRepository(ApplyMessage)
    private readonly applyMessageRepo: Repository<ApplyMessage>,
  ) {}

  async create(dto: CreateApplyMessageDto) {
    const applyMessage = this.applyMessageRepo.create({
      institute_name: dto.institute_name.trim(),
      contact_person: dto.contact_person.trim(),
      email_address: dto.email_address.trim().toLowerCase(),
      phone_number: dto.phone_number.trim(),
      about_your_institute: dto.about_your_institute.trim(),
    });

    return this.applyMessageRepo.save(applyMessage);
  }
}
