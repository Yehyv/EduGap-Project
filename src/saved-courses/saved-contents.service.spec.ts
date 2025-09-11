import { Test, TestingModule } from '@nestjs/testing';
import { SavedCoursesService } from './saved-contents.service';

describe('SavedCoursesService', () => {
  let service: SavedCoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedCoursesService],
    }).compile();

    service = module.get<SavedCoursesService>(SavedCoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
