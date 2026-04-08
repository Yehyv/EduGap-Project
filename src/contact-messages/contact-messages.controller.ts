import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@UseGuards(JwtAuthGuard)
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  @Post()
  async create(
    @Body() createContactMessageDto: CreateContactMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = Number(req.user?.sub);

    const data = await this.contactMessagesService.create(
      createContactMessageDto,
      userId,
    );

    return {
      status: 201,
      message: 'Contact message created successfully',
      data,
    };
  }
}
