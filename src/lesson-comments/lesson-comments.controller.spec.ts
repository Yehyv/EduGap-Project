import { Test, TestingModule } from '@nestjs/testing';
import { LessonCommentsController } from './lesson-comments.controller';
import { LessonCommentsService } from './lesson-comments.service';

describe('LessonCommentsController', () => {
  let controller: LessonCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonCommentsController],
      providers: [LessonCommentsService],
    }).compile();

    controller = module.get<LessonCommentsController>(LessonCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
