import { Test, TestingModule } from '@nestjs/testing';
import { PrerequiestContentsService } from './prerequiest-contents.service';

describe('PrerequiestContentsService', () => {
  let service: PrerequiestContentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrerequiestContentsService],
    }).compile();

    service = module.get<PrerequiestContentsService>(
      PrerequiestContentsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
