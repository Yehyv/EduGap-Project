import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractInstallment } from 'src/contract-installments/entities/contract-installment.entity';
import { ContractPayment } from 'src/contract-payments/entities/contract-payment.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { SubscriptionPlan } from 'src/subscription-plans/entities/subscription-plan.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { InstituteAnnualContract } from './entities/institute-annual-contract.entity';
import { InstituteAnnualContractsController } from './institute-annual-contracts.controller';
import { InstituteAnnualContractsService } from './institute-annual-contracts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstituteAnnualContract,
      SubscriptionPlan,
      Institute,
      SystemUser,
      ContractInstallment,
      ContractPayment,
    ]),
  ],
  controllers: [InstituteAnnualContractsController],
  providers: [InstituteAnnualContractsService],
  exports: [InstituteAnnualContractsService, TypeOrmModule],
})
export class InstituteAnnualContractsModule {}
