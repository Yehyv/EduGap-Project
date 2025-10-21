import { Test, TestingModule } from '@nestjs/testing';
import { SavedLessonService } from './saved-lesson.service';

describe('SavedLessonService', () => {
  let service: SavedLessonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedLessonService],
    }).compile();

    service = module.get<SavedLessonService>(SavedLessonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
