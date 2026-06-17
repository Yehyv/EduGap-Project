import { Test, TestingModule } from '@nestjs/testing';
import { PlanUpgradeRequestsService } from './plan-upgrade-requests.service';

describe('PlanUpgradeRequestsService', () => {
  let service: PlanUpgradeRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanUpgradeRequestsService],
    }).compile();

    service = module.get<PlanUpgradeRequestsService>(
      PlanUpgradeRequestsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
