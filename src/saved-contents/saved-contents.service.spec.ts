import { Test, TestingModule } from '@nestjs/testing';
import { SavedContentsService } from './saved-contents.service';

describe('SavedContentsService', () => {
  let service: SavedContentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedContentsService],
    }).compile();

    service = module.get<SavedContentsService>(SavedContentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
