import { Test, TestingModule } from '@nestjs/testing';
import { ApplyMessagesService } from './apply-messages.service';

describe('ApplyMessagesService', () => {
  let service: ApplyMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplyMessagesService],
    }).compile();

    service = module.get<ApplyMessagesService>(ApplyMessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
