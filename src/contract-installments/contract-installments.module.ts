import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractPayment } from 'src/contract-payments/entities/contract-payment.entity';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { ContractInstallmentsController } from './contract-installments.controller';
import { ContractInstallmentsService } from './contract-installments.service';
import { ContractInstallment } from './entities/contract-installment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContractInstallment,
      InstituteAnnualContract,
      ContractPayment,
    ]),
  ],
  controllers: [ContractInstallmentsController],
  providers: [ContractInstallmentsService],
  exports: [ContractInstallmentsService, TypeOrmModule],
})
export class ContractInstallmentsModule {}
