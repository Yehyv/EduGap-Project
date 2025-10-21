import { Test, TestingModule } from '@nestjs/testing';
import { ContentReviewsController } from './content-reviews.controller';
import { ContentReviewsService } from './content-reviews.service';

describe('ContentReviewsController', () => {
  let controller: ContentReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentReviewsController],
      providers: [ContentReviewsService],
    }).compile();

    controller = module.get<ContentReviewsController>(ContentReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
