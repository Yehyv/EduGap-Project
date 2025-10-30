import { Test, TestingModule } from '@nestjs/testing';
import { SavedPackagesService } from './saved-packages.service';

describe('SavedPackagesService', () => {
  let service: SavedPackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedPackagesService],
    }).compile();

    service = module.get<SavedPackagesService>(SavedPackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
