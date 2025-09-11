import { Test, TestingModule } from '@nestjs/testing';
import { SavedCoursesController } from './saved-contents.controller';
import { SavedCoursesService } from './saved-contents.service';

describe('SavedCoursesController', () => {
  let controller: SavedCoursesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedCoursesController],
      providers: [SavedCoursesService],
    }).compile();

    controller = module.get<SavedCoursesController>(SavedCoursesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
