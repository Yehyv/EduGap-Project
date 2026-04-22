import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ContactMessagesService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepo: Repository<ContactMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateContactMessageDto, userId?: number) {
    let user: User | null = null;

    if (userId !== undefined) {
      user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    const contactMessage = this.contactMessageRepo.create({
      full_name: dto.full_name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone_number: dto.phone_number?.trim() || null,
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      user,
    });

    return this.contactMessageRepo.save(contactMessage);
  }
}
