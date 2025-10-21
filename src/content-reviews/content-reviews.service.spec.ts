import { Test, TestingModule } from '@nestjs/testing';
import { ContentReviewsService } from './content-reviews.service';

describe('ContentReviewsService', () => {
  let service: ContentReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentReviewsService],
    }).compile();

    service = module.get<ContentReviewsService>(ContentReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
