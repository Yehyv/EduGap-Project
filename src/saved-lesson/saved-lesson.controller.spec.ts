import { Test, TestingModule } from '@nestjs/testing';
import { SavedLessonController } from './saved-lesson.controller';
import { SavedLessonService } from './saved-lesson.service';

describe('SavedLessonController', () => {
  let controller: SavedLessonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedLessonController],
      providers: [SavedLessonService],
    }).compile();

    controller = module.get<SavedLessonController>(SavedLessonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
