import { Test, TestingModule } from '@nestjs/testing';
import { LessonReactionsService } from './lesson-reactions.service';

describe('LessonReactionsService', () => {
  let service: LessonReactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonReactionsService],
    }).compile();

    service = module.get<LessonReactionsService>(LessonReactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
