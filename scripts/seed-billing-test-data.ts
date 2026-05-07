import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { SubscriptionPlan } from '../src/subscription-plans/entities/subscription-plan.entity';
import {
  ContractStatus,
  DiscountType,
  InstituteAnnualContract,
} from '../src/institute-annual-contracts/entities/institute-annual-contract.entity';
import {
  ContractInstallment,
  InstallmentStatus,
} from '../src/contract-installments/entities/contract-installment.entity';
import {
  ContractPayment,
  PaymentMethod,
  PaymentStatus,
} from '../src/contract-payments/entities/contract-payment.entity';
import { Institute } from '../src/institutes/entities/institute.entity';
import { SystemUser } from '../src/system-users/entities/system-user.entity';

function mustRunOnlyWhenAllowed() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.ALLOW_TEST_SEED !== 'true'
  ) {
    throw new Error(
      'Refusing to run billing seed. Set ALLOW_TEST_SEED=true and never run it in production.',
    );
  }
}

function round2(value: number) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

async function main() {
  mustRunOnlyWhenAllowed();

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    await dataSource.transaction(async (manager) => {
      const planRepo = manager.getRepository(SubscriptionPlan);
      const instituteRepo = manager.getRepository(Institute);
      const systemUserRepo = manager.getRepository(SystemUser);
      const contractRepo = manager.getRepository(InstituteAnnualContract);
      const installmentRepo = manager.getRepository(ContractInstallment);
      const paymentRepo = manager.getRepository(ContractPayment);

      const admin = await systemUserRepo.findOne({ where: {} });
      const institutes = await instituteRepo.find({ take: 10 });

      if (!institutes.length) {
        throw new Error(
          'No institutes found. Run the main project seed first.',
        );
      }

      const planData = [
        ['Starter', 1, 100, 200, 4, 10],
        ['Growth', 101, 1000, 180, 4, 20],
        ['Enterprise', 1001, 5000, 150, 6, 30],
      ] as const;

      const plans: SubscriptionPlan[] = [];

      for (const [
        name,
        min,
        max,
        price,
        installments,
        administrativeFees,
      ] of planData) {
        let plan = await planRepo.findOne({ where: { plan_name: name } });

        if (!plan) {
          plan = await planRepo.save(
            planRepo.create({
              plan_name: name,
              min_students: min,
              max_students: max,
              default_price_per_student: price,
              default_installments_count: installments,
              description: `${name} billing seed plan`,
              is_active: 1,
              createdBy: admin ?? null,
              administrative_fees: administrativeFees,
            }),
          );
        }

        plans.push(plan);
      }

      for (let index = 0; index < institutes.length; index++) {
        const institute = institutes[index];
        const plan = plans[index % plans.length];
        const academicYear = new Date().getFullYear();
        const maxStudents = Math.min(
          plan.max_students,
          Math.max(plan.min_students, 50 + index * 10),
        );
        const price = Number(plan.default_price_per_student);
        const packageAmount = round2(maxStudents * price);
        const discountValue = 10;
        const discountAmount = round2((packageAmount * discountValue) / 100);
        const amountAfterDiscount = round2(packageAmount - discountAmount);
        const administrativeFees = 5000;
        const taxPercentage = 14;
        const taxBase = round2(amountAfterDiscount + administrativeFees);
        const taxAmount = round2((taxBase * taxPercentage) / 100);
        const totalAmount = round2(taxBase + taxAmount);

        let contract = await contractRepo.findOne({
          where: {
            institute: { id: institute.id },
            academic_year: academicYear,
          },
        });

        if (!contract) {
          contract = await contractRepo.save(
            contractRepo.create({
              institute,
              plan,
              academic_year: academicYear,
              max_students_allowed: maxStudents,
              price_per_student: price,
              package_amount: packageAmount,
              discount_type: DiscountType.PERCENTAGE,
              discount_value: discountValue,
              discount_amount: discountAmount,
              amount_after_discount: amountAfterDiscount,
              administrative_fees: administrativeFees,
              tax_percentage: taxPercentage,
              tax_amount: taxAmount,
              total_amount: totalAmount,
              installments_count: Number(plan.default_installments_count),
              payment_percentage: 0,
              contract_start_date: `${academicYear}-01-01`,
              contract_end_date: `${academicYear}-12-31`,
              status: ContractStatus.ACTIVE,
              notes: 'Seed annual contract',
              createdBy: admin ?? null,
            }),
          );
        }

        const existingInstallments = await installmentRepo.count({
          where: { contract: { id: contract.id } },
        });

        if (!existingInstallments) {
          const count = contract.installments_count || 4;
          const amount = round2(Number(contract.total_amount) / count);

          for (let i = 1; i <= count; i++) {
            const due = new Date(academicYear, (i - 1) * 3, 15);

            await installmentRepo.save(
              installmentRepo.create({
                contract,
                installment_no: i,
                due_date: due.toISOString().slice(0, 10),
                installment_percentage: round2(100 / count),
                installment_amount: amount,
                paid_amount: i === 1 ? amount : 0,
                remaining_amount: i === 1 ? 0 : amount,
                status:
                  i === 1 ? InstallmentStatus.PAID : InstallmentStatus.PENDING,
              }),
            );
          }
        }

        const firstInstallment = await installmentRepo.findOne({
          where: { contract: { id: contract.id }, installment_no: 1 },
        });

        const existingPayment = firstInstallment
          ? await paymentRepo.findOne({
              where: {
                contract: { id: contract.id },
                installment: { id: firstInstallment.id },
              },
            })
          : null;

        if (firstInstallment && !existingPayment) {
          await paymentRepo.save(
            paymentRepo.create({
              contract,
              installment: firstInstallment,
              payment_date: new Date().toISOString().slice(0, 10),
              paid_amount: Number(firstInstallment.installment_amount),
              payment_method: PaymentMethod.BANK_TRANSFER,
              status: PaymentStatus.CONFIRMED,
              receipt_no: `SEED-${contract.id}-1`,
              createdBy: admin ?? null,
            }),
          );
        }
      }
    });

    console.log('✅ Billing seed completed.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('❌ Billing seed failed:');
  console.error(error);
  process.exit(1);
});
