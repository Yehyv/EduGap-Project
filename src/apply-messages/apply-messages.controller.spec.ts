import { Test, TestingModule } from '@nestjs/testing';
import { ApplyMessagesController } from './apply-messages.controller';
import { ApplyMessagesService } from './apply-messages.service';

describe('ApplyMessagesController', () => {
  let controller: ApplyMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplyMessagesController],
      providers: [ApplyMessagesService],
    }).compile();

    controller = module.get<ApplyMessagesController>(ApplyMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
