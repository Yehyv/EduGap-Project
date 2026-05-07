import { Module } from '@nestjs/common';
import { AnnualSettlementsController } from './annual-settlements.controller';
import { AnnualSettlementsService } from './annual-settlements.service';

@Module({
  controllers: [AnnualSettlementsController],
  providers: [AnnualSettlementsService],
  exports: [AnnualSettlementsService],
})
export class AnnualSettlementsModule {}
