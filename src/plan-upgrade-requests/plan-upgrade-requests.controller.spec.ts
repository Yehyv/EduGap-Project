import { Test, TestingModule } from '@nestjs/testing';
import { PlanUpgradeRequestsController } from './plan-upgrade-requests.controller';
import { PlanUpgradeRequestsService } from './plan-upgrade-requests.service';

describe('PlanUpgradeRequestsController', () => {
  let controller: PlanUpgradeRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanUpgradeRequestsController],
      providers: [PlanUpgradeRequestsService],
    }).compile();

    controller = module.get<PlanUpgradeRequestsController>(
      PlanUpgradeRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
