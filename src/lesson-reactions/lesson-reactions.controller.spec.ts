import { Test, TestingModule } from '@nestjs/testing';
import { LessonReactionsController } from './lesson-reactions.controller';
import { LessonReactionsService } from './lesson-reactions.service';

describe('LessonReactionsController', () => {
  let controller: LessonReactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonReactionsController],
      providers: [LessonReactionsService],
    }).compile();

    controller = module.get<LessonReactionsController>(
      LessonReactionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
