import { Test, TestingModule } from '@nestjs/testing';
import { SavedContentsController } from './saved-contents.controller';
import { SavedContentsService } from './saved-contents.service';

describe('SavedContentsController', () => {
  let controller: SavedContentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedContentsController],
      providers: [SavedContentsService],
    }).compile();

    controller = module.get<SavedContentsController>(SavedContentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
