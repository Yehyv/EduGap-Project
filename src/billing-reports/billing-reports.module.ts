import { Module } from '@nestjs/common';
import { BillingReportsController } from './billing-reports.controller';
import { BillingReportsService } from './billing-reports.service';

@Module({
  controllers: [BillingReportsController],
  providers: [BillingReportsService],
})
export class BillingReportsModule {}
