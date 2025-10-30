import { Test, TestingModule } from '@nestjs/testing';
import { SavedPackagesController } from './saved-packages.controller';
import { SavedPackagesService } from './saved-packages.service';

describe('SavedPackagesController', () => {
  let controller: SavedPackagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedPackagesController],
      providers: [SavedPackagesService],
    }).compile();

    controller = module.get<SavedPackagesController>(SavedPackagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
