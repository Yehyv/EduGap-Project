import { Module } from '@nestjs/common';
import { BillingDashboardController } from './billing-dashboard.controller';
import { BillingDashboardService } from './billing-dashboard.service';

@Module({
  controllers: [BillingDashboardController],
  providers: [BillingDashboardService],
})
export class BillingDashboardModule {}
