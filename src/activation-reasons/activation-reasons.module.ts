import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivationReason } from './entities/activation-reason.entity';
import { ActivationReasonsService } from './activation-reasons.service';
import { ActivationReasonsController } from './activation-reasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActivationReason])],
  controllers: [ActivationReasonsController],
  providers: [ActivationReasonsService],
  exports: [ActivationReasonsService],
})
export class ActivationReasonsModule {}
