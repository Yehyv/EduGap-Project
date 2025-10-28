import { Test, TestingModule } from '@nestjs/testing';
import { EducatorReviewsService } from './educator-reviews.service';

describe('EducatorReviewsService', () => {
  let service: EducatorReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducatorReviewsService],
    }).compile();

    service = module.get<EducatorReviewsService>(EducatorReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
