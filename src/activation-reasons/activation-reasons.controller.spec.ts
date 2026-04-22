import { Test, TestingModule } from '@nestjs/testing';
import { ActivationReasonsController } from './activation-reasons.controller';
import { ActivationReasonsService } from './activation-reasons.service';

describe('ActivationReasonsController', () => {
  let controller: ActivationReasonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivationReasonsController],
      providers: [ActivationReasonsService],
    }).compile();

    controller = module.get<ActivationReasonsController>(
      ActivationReasonsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
