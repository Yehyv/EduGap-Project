import { Test, TestingModule } from '@nestjs/testing';
import { ActivationReasonsService } from './activation-reasons.service';

describe('ActivationReasonsService', () => {
  let service: ActivationReasonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivationReasonsService],
    }).compile();

    service = module.get<ActivationReasonsService>(ActivationReasonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
