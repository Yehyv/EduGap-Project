import { Test, TestingModule } from '@nestjs/testing';
import { LessonNotesController } from './lesson-notes.controller';
import { LessonNotesService } from './lesson-notes.service';

describe('LessonNotesController', () => {
  let controller: LessonNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonNotesController],
      providers: [LessonNotesService],
    }).compile();

    controller = module.get<LessonNotesController>(LessonNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
