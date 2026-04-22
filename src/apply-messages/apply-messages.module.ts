import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplyMessagesService } from './apply-messages.service';
import { ApplyMessagesController } from './apply-messages.controller';
import { ApplyMessage } from './entities/apply-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplyMessage])],
  controllers: [ApplyMessagesController],
  providers: [ApplyMessagesService],
})
export class ApplyMessagesModule {}
