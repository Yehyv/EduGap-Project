import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';

import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

interface OptionalAuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

@UseGuards(OptionalJwtAuthGuard)
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  @Post()
  async create(
    @Body() createContactMessageDto: CreateContactMessageDto,
    @Req() req: OptionalAuthenticatedRequest,
  ) {
    const userId = req.user?.sub;

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
