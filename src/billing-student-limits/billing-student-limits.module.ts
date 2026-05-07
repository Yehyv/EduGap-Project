import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { BillingStudentLimitsService } from './billing-student-limits.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstituteAnnualContract, User])],
  providers: [BillingStudentLimitsService],
  exports: [BillingStudentLimitsService],
})
export class BillingStudentLimitsModule {}
