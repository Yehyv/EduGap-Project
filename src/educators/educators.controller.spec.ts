import { Test, TestingModule } from '@nestjs/testing';
import { EducatorsController } from './educators.controller';
import { EducatorsService } from './educators.service';

describe('EducatorsController', () => {
  let controller: EducatorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducatorsController],
      providers: [EducatorsService],
    }).compile();

    controller = module.get<EducatorsController>(EducatorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
