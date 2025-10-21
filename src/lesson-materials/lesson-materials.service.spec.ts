import { Test, TestingModule } from '@nestjs/testing';
import { LessonMaterialsService } from './lesson-materials.service';

describe('LessonMaterialsService', () => {
  let service: LessonMaterialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonMaterialsService],
    }).compile();

    service = module.get<LessonMaterialsService>(LessonMaterialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
