import { Test, TestingModule } from '@nestjs/testing';
import { EducatorReviewsController } from './educator-reviews.controller';
import { EducatorReviewsService } from './educator-reviews.service';

describe('EducatorReviewsController', () => {
  let controller: EducatorReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducatorReviewsController],
      providers: [EducatorReviewsService],
    }).compile();

    controller = module.get<EducatorReviewsController>(
      EducatorReviewsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
