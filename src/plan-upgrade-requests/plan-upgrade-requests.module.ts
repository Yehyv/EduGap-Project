import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanUpgradeRequest } from './entities/plan-upgrade-request.entity';
import { PlanUpgradeRequestsController } from './plan-upgrade-requests.controller';
import { PlanUpgradeRequestsService } from './plan-upgrade-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([PlanUpgradeRequest])],
  controllers: [PlanUpgradeRequestsController],
  providers: [PlanUpgradeRequestsService],
  exports: [PlanUpgradeRequestsService],
})
export class PlanUpgradeRequestsModule {}