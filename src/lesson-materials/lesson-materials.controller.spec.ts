import { Test, TestingModule } from '@nestjs/testing';
import { LessonMaterialsController } from './lesson-materials.controller';
import { LessonMaterialsService } from './lesson-materials.service';

describe('LessonMaterialsController', () => {
  let controller: LessonMaterialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonMaterialsController],
      providers: [LessonMaterialsService],
    }).compile();

    controller = module.get<LessonMaterialsController>(
      LessonMaterialsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
