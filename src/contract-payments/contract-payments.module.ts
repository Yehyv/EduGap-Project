import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractInstallmentsModule } from 'src/contract-installments/contract-installments.module';
import { ContractInstallment } from 'src/contract-installments/entities/contract-installment.entity';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { ContractPaymentsController } from './contract-payments.controller';
import { ContractPaymentsService } from './contract-payments.service';
import { ContractPayment } from './entities/contract-payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractPayment,
      InstituteAnnualContract,
      ContractInstallment,
      SystemUser,
    ]),
    ContractInstallmentsModule,
  ],
  controllers: [ContractPaymentsController],
  providers: [ContractPaymentsService],
  exports: [ContractPaymentsService, TypeOrmModule],
})
export class ContractPaymentsModule {}
