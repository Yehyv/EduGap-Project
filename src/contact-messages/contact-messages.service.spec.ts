import { Test, TestingModule } from '@nestjs/testing';
import { ContactMessagesService } from './contact-messages.service';

describe('ContactMessagesService', () => {
  let service: ContactMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactMessagesService],
    }).compile();

    service = module.get<ContactMessagesService>(ContactMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
