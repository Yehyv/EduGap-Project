import { Test, TestingModule } from '@nestjs/testing';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';

describe('ContactMessagesController', () => {
  let controller: ContactMessagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactMessagesController],
      providers: [ContactMessagesService],
    }).compile();

    controller = module.get<ContactMessagesController>(ContactMessagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
