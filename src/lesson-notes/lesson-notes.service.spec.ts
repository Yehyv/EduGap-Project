import { Test, TestingModule } from '@nestjs/testing';
import { LessonNotesService } from './lesson-notes.service';

describe('LessonNotesService', () => {
  let service: LessonNotesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonNotesService],
    }).compile();

    service = module.get<LessonNotesService>(LessonNotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
