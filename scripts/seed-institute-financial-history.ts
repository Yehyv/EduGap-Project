import { NestFactory } from '@nestjs/core';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';

import { RoleCategory } from '../src/common/enums/role-category.enum';
import { Language } from '../src/languages/entities/language.entity';
import { SystemRole } from '../src/system-roles/entities/system-role.entity';
import { SystemUser } from '../src/system-users/entities/system-user.entity';
import { Country } from '../src/countries/entities/country.entity';
import { City } from '../src/cities/entities/city.entity';
import { Region } from '../src/regions/entities/region.entity';
import { Institute } from '../src/institutes/entities/institute.entity';

import { SubscriptionPlansService } from '../src/subscription-plans/subscription-plans.service';
import { SubscriptionPlan } from '../src/subscription-plans/entities/subscription-plan.entity';

import { InstituteAnnualContractsService } from '../src/institute-annual-contracts/institute-annual-contracts.service';
import {
  ContractStatus,
  DiscountType,
  InstituteAnnualContract,
} from '../src/institute-annual-contracts/entities/institute-annual-contract.entity';

import { ContractInstallmentsService } from '../src/contract-installments/contract-installments.service';
import { ContractInstallment } from '../src/contract-installments/entities/contract-installment.entity';

import { ContractPaymentsService } from '../src/contract-payments/contract-payments.service';
import {
  ContractPayment,
  PaymentMethod,
} from '../src/contract-payments/entities/contract-payment.entity';

const NATIONAL_ID = '29801011000000';
const PHONE_KEY = '020';
const PHONE = '1012000000';
const PASSWORD = 'Test@123456';
const IMAGE_URL = 'https://example.com/test-seed-image.png';

type SeedAuthUser = {
  sub: number;
  email: string;
  instituteId: number;
  role?: string;
};

function mustRunOnlyWhenAllowed() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_PROD_SEED !== 'true'
  ) {
    throw new Error(
      'Refusing to run against a production NODE_ENV. Set ALLOW_PROD_SEED=true if you really intend to write to this database.',
    );
  }

  if (process.env.ALLOW_TEST_SEED !== 'true') {
    throw new Error(
      'Refusing to run financial history seed. Set ALLOW_TEST_SEED=true.',
    );
  }
}

function round2(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

async function findOrCreate<T extends ObjectLiteral>(
  repo: Repository<T>,
  where: any,
  data: any,
  label: string,
): Promise<T> {
  const existing = await repo.findOne({ where } as any);

  if (existing) {
    console.log(`exists: ${label}`);
    return existing;
  }

  const entity = repo.create(data as any);
  const saved = await repo.save(entity as any);
  console.log(`created: ${label}`);
  return saved as T;
}

interface YearPlan {
  academicYear: number;
  isCurrentYear: boolean;
  planName: string;
  minStudents: number;
  maxStudents: number;
  pricePerStudent: number;
  installmentsCount: number;
  administrativeFees: number;
  discountType: DiscountType;
  discountValue: number;
  taxPercentage: number;
  maxStudentsAllowed: number;
  /** how many of the generated installments get fully paid via real payments */
  installmentsToPayFully: number;
}

const YEAR_PLANS: YearPlan[] = [
  {
    academicYear: 2023,
    isCurrentYear: false,
    planName: 'Starter (Legacy)',
    minStudents: 1,
    maxStudents: 100,
    pricePerStudent: 150,
    installmentsCount: 2,
    administrativeFees: 2000,
    discountType: DiscountType.FIXED,
    discountValue: 0,
    taxPercentage: 14,
    maxStudentsAllowed: 30,
    installmentsToPayFully: 2,
  },
  {
    academicYear: 2024,
    isCurrentYear: false,
    planName: 'Growth (Legacy)',
    minStudents: 1,
    maxStudents: 300,
    pricePerStudent: 170,
    installmentsCount: 4,
    administrativeFees: 3000,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 5,
    taxPercentage: 14,
    maxStudentsAllowed: 60,
    installmentsToPayFully: 4,
  },
  {
    academicYear: 2025,
    isCurrentYear: false,
    planName: 'Growth',
    minStudents: 1,
    maxStudents: 300,
    pricePerStudent: 180,
    installmentsCount: 4,
    administrativeFees: 3500,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    taxPercentage: 14,
    maxStudentsAllowed: 80,
    installmentsToPayFully: 4,
  },
  {
    academicYear: 2026,
    isCurrentYear: true,
    planName: 'Premium',
    minStudents: 1,
    maxStudents: 1000,
    pricePerStudent: 200,
    installmentsCount: 4,
    administrativeFees: 5000,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    taxPercentage: 14,
    maxStudentsAllowed: 100,
    installmentsToPayFully: 2,
  },
];

async function main() {
  mustRunOnlyWhenAllowed();

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const dataSource = app.get(DataSource);
  const plansService = app.get(SubscriptionPlansService);
  const contractsService = app.get(InstituteAnnualContractsService);
  const installmentsService = app.get(ContractInstallmentsService);
  const paymentsService = app.get(ContractPaymentsService);

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const today = new Date().toISOString().slice(0, 10);

  const languageRepo = dataSource.getRepository(Language);
  const roleRepo = dataSource.getRepository(SystemRole);
  const systemUserRepo = dataSource.getRepository(SystemUser);
  const countryRepo = dataSource.getRepository(Country);
  const cityRepo = dataSource.getRepository(City);
  const regionRepo = dataSource.getRepository(Region);
  const instituteRepo = dataSource.getRepository(Institute);
  const planRepo = dataSource.getRepository(SubscriptionPlan);
  const contractRepo = dataSource.getRepository(InstituteAnnualContract);
  const installmentRepo = dataSource.getRepository(ContractInstallment);
  const paymentRepo = dataSource.getRepository(ContractPayment);

  try {
    // 1) Geography (reuse existing if present, otherwise create minimal)
    const ar = await findOrCreate(
      languageRepo,
      { name: 'Arabic' },
      { name: 'Arabic', isDefault: 1, isActive: 1 },
      'language: Arabic',
    );
    const en = await findOrCreate(
      languageRepo,
      { name: 'English' },
      { name: 'English', isDefault: 0, isActive: 1 },
      'language: English',
    );

    let region = await regionRepo.findOne({ where: {} });

    if (!region) {
      const country = await findOrCreate(
        countryRepo,
        {},
        {
          isActive: 1,
          translations: [
            { name: 'مصر', language: ar },
            { name: 'Egypt', language: en },
          ],
        },
        'country: Egypt',
      );
      const city = await findOrCreate(
        cityRepo,
        {},
        {
          isActive: 1,
          country,
          translations: [
            { name: 'القاهرة', language: ar },
            { name: 'Cairo', language: en },
          ],
        },
        'city: Cairo',
      );
      region = await findOrCreate(
        regionRepo,
        {},
        {
          isActive: 1,
          city,
          translations: [
            { name: 'مدينة نصر', language: ar },
            { name: 'Nasr City', language: en },
          ],
        },
        'region: Nasr City',
      );
    } else {
      console.log('exists: region (reusing first available)');
    }

    // 2) Roles + super admin (used as createdBy for plans/contracts/payments)
    const superAdminRole = await findOrCreate(
      roleRepo,
      { role_title: 'SUPER_ADMIN' },
      {
        role_title: 'SUPER_ADMIN',
        role_category: RoleCategory.DASHBOARD,
        is_active: 1,
      },
      'role: SUPER_ADMIN',
    );
    const instAdminRole = await findOrCreate(
      roleRepo,
      { role_title: 'INST_ADMIN' },
      {
        role_title: 'INST_ADMIN',
        role_category: RoleCategory.DASHBOARD,
        is_active: 1,
      },
      'role: INST_ADMIN',
    );

    const superAdmin = await findOrCreate(
      systemUserRepo,
      { email: 'seed.super.admin@edugap.test' },
      {
        full_name: 'Seed Super Admin',
        email: 'seed.super.admin@edugap.test',
        national_id: '19900000000001',
        phone_key: '020',
        phone: '1000000001',
        username: 'seed_super_admin',
        password: passwordHash,
        refresh_token: null,
        is_active: 1,
        SysUserrole: superAdminRole,
        institute: null,
      },
      'system_user: Seed Super Admin',
    );

    // 3) The target institute + its admin (the account given by the user)
    const institute = await findOrCreate(
      instituteRepo,
      { email: 'finance.history.institute@edugap.test' },
      {
        logo: IMAGE_URL,
        image_profile: IMAGE_URL,
        email: 'finance.history.institute@edugap.test',
        phone_key: '020',
        phone: '1099000000',
        is_active: 1,
        region,
        createdBy: superAdmin,
        translations: [
          {
            name: 'معهد السجل المالي',
            address: 'القاهرة - مصر',
            contactPersopnName: 'مدير المعهد',
            contactPersonPostion: 'مدير',
            language: ar,
          },
          {
            name: 'Financial History Institute',
            address: 'Cairo, Egypt',
            contactPersopnName: 'Institute Manager',
            contactPersonPostion: 'Manager',
            language: en,
          },
        ],
      },
      'institute: Financial History Institute',
    );

    const instituteAdmin = await findOrCreate(
      systemUserRepo,
      { national_id: NATIONAL_ID, phone: PHONE },
      {
        full_name: 'Financial History Institute Admin',
        email: 'finance.history.admin@edugap.test',
        national_id: NATIONAL_ID,
        phone_key: PHONE_KEY,
        phone: PHONE,
        username: 'finance_history_admin',
        password: passwordHash,
        refresh_token: null,
        is_active: 1,
        SysUserrole: instAdminRole,
        institute,
      },
      `system_user: institute admin (${NATIONAL_ID} / ${PHONE})`,
    );

    if (!instituteAdmin.institute) {
      await systemUserRepo.update(
        { id: instituteAdmin.id } as any,
        { institute } as any,
      );
    }

    const instituteAdminAuthUser: SeedAuthUser = {
      sub: instituteAdmin.id,
      email: instituteAdmin.email,
      instituteId: institute.id,
      role: 'INST_ADMIN',
    };

    // 4) Plans + contracts + installments + payments, year by year - all
    // through the real services so the seeded data exercises (and stays
    // consistent with) the exact same business rules the API enforces.
    for (const yearPlan of YEAR_PLANS) {
      let plan = await planRepo.findOne({
        where: { plan_name: yearPlan.planName },
      });

      if (!plan) {
        const created = await plansService.create(
          {
            plan_name: yearPlan.planName,
            min_students: yearPlan.minStudents,
            max_students: yearPlan.maxStudents,
            default_price_per_student: yearPlan.pricePerStudent,
            default_installments_count: yearPlan.installmentsCount,
            description: `${yearPlan.planName} subscription plan`,
            administrative_fees: yearPlan.administrativeFees,
          } as any,
          superAdmin.id,
        );
        plan = await planRepo.findOne({ where: { id: created.id } });
        console.log(`created: plan ${yearPlan.planName}`);
      } else {
        console.log(`exists: plan ${yearPlan.planName}`);
      }

      let contract = await contractRepo.findOne({
        where: {
          institute: { id: institute.id },
          academic_year: yearPlan.academicYear,
        },
      });

      if (!contract) {
        const created = await contractsService.create(
          {
            instituteId: institute.id,
            planId: plan!.id,
            academicYear: yearPlan.academicYear,
            maxStudentsAllowed: yearPlan.maxStudentsAllowed,
            pricePerStudent: yearPlan.pricePerStudent,
            discountType: yearPlan.discountType,
            discountValue: yearPlan.discountValue,
            administrativeFees: yearPlan.administrativeFees,
            taxPercentage: yearPlan.taxPercentage,
            installmentsCount: yearPlan.installmentsCount,
            contractStartDate: `${yearPlan.academicYear}-01-15`,
            contractEndDate: `${yearPlan.academicYear}-12-15`,
            notes: `Seed financial history - academic year ${yearPlan.academicYear}`,
          } as any,
          superAdmin.id,
        );
        contract = await contractRepo.findOne({ where: { id: created.id } });
        console.log(`created: contract ${yearPlan.academicYear}`);
      } else {
        console.log(`exists: contract ${yearPlan.academicYear}`);
      }

      if (contract!.status === ContractStatus.DRAFT) {
        await contractsService.activate(contract!.id);
        contract = await contractRepo.findOne({ where: { id: contract!.id } });
        console.log(`activated: contract ${yearPlan.academicYear}`);
      }

      let installments = await installmentRepo.find({
        where: { contract: { id: contract!.id } },
        order: { installment_no: 'ASC' },
      });

      if (!installments.length) {
        const monthsPerInstallment = Math.max(
          1,
          Math.floor(12 / yearPlan.installmentsCount),
        );
        await installmentsService.generate(contract!.id, {
          firstDueDate: contract!.contract_start_date,
          intervalMonths: monthsPerInstallment,
        } as any);
        installments = await installmentRepo.find({
          where: { contract: { id: contract!.id } },
          order: { installment_no: 'ASC' },
        });
        console.log(
          `generated: ${installments.length} installments for contract ${yearPlan.academicYear}`,
        );
      } else {
        console.log(
          `exists: installments for contract ${yearPlan.academicYear}`,
        );
      }

      const existingPaymentsCount = await paymentRepo.count({
        where: { contract: { id: contract!.id } },
      });

      if (existingPaymentsCount > 0) {
        console.log(`exists: payments for contract ${yearPlan.academicYear}`);
      } else {
        let receiptUploaded = false;

        for (let idx = 0; idx < installments.length; idx++) {
          const installment = installments[idx];

          if (idx >= yearPlan.installmentsToPayFully) break;

          const payment = await paymentsService.create(
            {
              contractId: contract!.id,
              installmentId: installment.id,
              paymentDate: installment.due_date,
              paidAmount: Number(installment.installment_amount),
              paymentMethod:
                idx % 2 === 0 ? PaymentMethod.CASH : PaymentMethod.BANK_TRANSFER,
              receiptNo: `HIST-${contract!.id}-${installment.installment_no}`,
              notes: `Seed historical payment - installment ${installment.installment_no}`,
            } as any,
            superAdmin.id,
          );
          console.log(
            `created: CONFIRMED payment for installment ${installment.installment_no} (${installment.installment_amount})`,
          );

          // Exercise the receipt-upload function once per contract, on the
          // first confirmed payment.
          if (!receiptUploaded) {
            await paymentsService.uploadReceipt(
              (payment as any).id,
              '/uploads/receipts/seed-history-receipt.png',
            );
            receiptUploaded = true;
            console.log(
              `uploaded: receipt for payment #${(payment as any).id}`,
            );
          }
        }

        if (yearPlan.isCurrentYear) {
          const nextUnpaidInstallment = installments[yearPlan.installmentsToPayFully];

          if (nextUnpaidInstallment) {
            const proofAmount = round2(
              Number(nextUnpaidInstallment.installment_amount) / 2,
            );

            await paymentsService.uploadInstitutePaymentProof(
              {
                installmentId: nextUnpaidInstallment.id,
                amount: proofAmount,
                paymentMethod: PaymentMethod.BANK_TRANSFER,
                notes: 'Seed: institute-submitted proof awaiting review',
              } as any,
              '/uploads/payment-proofs/seed-history-proof.png',
              instituteAdminAuthUser,
            );
            console.log(
              `created: PENDING_REVIEW proof on installment ${nextUnpaidInstallment.installment_no} (${proofAmount})`,
            );
          }

          const totalAmount = Number(contract!.total_amount);

          const cancelledPayment = await paymentsService.create(
            {
              contractId: contract!.id,
              paymentDate: today,
              paidAmount: round2(totalAmount * 0.05),
              paymentMethod: PaymentMethod.CHEQUE,
              notes: 'Seed: cancelled payment for history realism',
            } as any,
            superAdmin.id,
          );
          await paymentsService.cancel(
            (cancelledPayment as any).id,
            { cancelReason: 'Seed: duplicate entry, cancelled during review' },
            superAdmin.id,
          );
          console.log(
            `created+cancelled: payment #${(cancelledPayment as any).id} for realism`,
          );

          const reversedOriginal = await paymentsService.create(
            {
              contractId: contract!.id,
              paymentDate: today,
              paidAmount: round2(totalAmount * 0.03),
              paymentMethod: PaymentMethod.BANK_TRANSFER,
              receiptNo: `HIST-REV-ORIG-${contract!.id}`,
              notes: 'Seed: payment later reversed for history realism',
            } as any,
            superAdmin.id,
          );
          await paymentsService.reverse(
            (reversedOriginal as any).id,
            { reason: 'Seed history realism' },
            superAdmin.id,
          );
          console.log(
            `created+reversed: payment pair for #${(reversedOriginal as any).id}`,
          );
        }
      }

      if (!yearPlan.isCurrentYear) {
        contract = await contractRepo.findOne({ where: { id: contract!.id } });
        if (contract!.status !== ContractStatus.CLOSED) {
          await contractsService.close(contract!.id);
          console.log(`closed: contract ${yearPlan.academicYear}`);
        }
      }
    }

    console.log('Financial history seed completed.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Financial history seed failed:');
  console.error(error);
  process.exit(1);
});
