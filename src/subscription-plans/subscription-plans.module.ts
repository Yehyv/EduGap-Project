import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionPlansService } from './subscription-plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      InstituteAnnualContract,
      SystemUser,
    ]),
  ],
  controllers: [SubscriptionPlansController],
  providers: [SubscriptionPlansService],
  exports: [SubscriptionPlansService, TypeOrmModule],
})
export class SubscriptionPlansModule {}
