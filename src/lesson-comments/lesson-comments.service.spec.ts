import { Test, TestingModule } from '@nestjs/testing';
import { LessonCommentsService } from './lesson-comments.service';

describe('LessonCommentsService', () => {
  let service: LessonCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonCommentsService],
    }).compile();

    service = module.get<LessonCommentsService>(LessonCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
