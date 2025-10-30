import { Test, TestingModule } from '@nestjs/testing';
import { SavedCoursesController } from './saved-course.controller';
import { SavedCoursesService } from './saved-course.service';

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
