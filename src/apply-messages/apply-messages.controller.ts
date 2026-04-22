import { Body, Controller, Post } from '@nestjs/common';
import { ApplyMessagesService } from './apply-messages.service';
import { CreateApplyMessageDto } from './dto/create-apply-message.dto';

@Controller('apply-messages')
export class ApplyMessagesController {
  constructor(private readonly applyMessagesService: ApplyMessagesService) {}

  @Post()
  async create(@Body() createApplyMessageDto: CreateApplyMessageDto) {
    const data = await this.applyMessagesService.create(createApplyMessageDto);

    return {
      status: 201,
      message: 'Apply message created successfully',
      data,
    };
  }
}
