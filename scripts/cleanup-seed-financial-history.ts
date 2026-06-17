import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Institute } from '../src/institutes/entities/institute.entity';
import { SystemUser } from '../src/system-users/entities/system-user.entity';
import { SubscriptionPlan } from '../src/subscription-plans/entities/subscription-plan.entity';
import { InstituteAnnualContract } from '../src/institute-annual-contracts/entities/institute-annual-contract.entity';

// This script is intentionally conservative: it never deletes a SystemUser
// (the institute admin is a real account, not something we created), and it
// only deletes plans whose name carries our seed tag, so it can never touch
// a real, unrelated plan even if names happen to collide (e.g. "Growth").
const SEED_TAG = '[SEED-FINHIST]';
const SEED_INSTITUTE_EMAIL = 'finance.history.institute@edugap.test';

// One-time cleanup for plans created by an earlier version of the seeder
// that used generic, non-tagged names. Only deleted if nothing references
// them anymore (e.g. after the orphan institute's contracts are gone).
// Deliberately does NOT include "Growth" or "Premium" alone - those exact
// names can collide with real, unrelated production plans.
const LEGACY_UNTAGGED_PLAN_NAMES = ['Starter (Legacy)', 'Growth (Legacy)'];

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const instituteRepo = dataSource.getRepository(Institute);
    const systemUserRepo = dataSource.getRepository(SystemUser);
    const planRepo = dataSource.getRepository(SubscriptionPlan);

    // Only the dedicated fallback institute we create when the target admin
    // has no real institute attached. A real institute would never have
    // this exact seed email, so this can never collide with real data.
    const institute = await instituteRepo.findOne({
      where: { email: SEED_INSTITUTE_EMAIL },
    });

    if (institute) {
      await systemUserRepo.update(
        { institute: { id: institute.id } } as any,
        { institute: null } as any,
      );
      await instituteRepo.delete({ id: institute.id } as any);
      console.log(
        `deleted fallback seed institute #${institute.id} (cascaded contracts/installments/payments)`,
      );
    } else {
      console.log('no fallback seed institute found, skipping');
    }

    const deletedPlans = await planRepo
      .createQueryBuilder()
      .delete()
      .from(SubscriptionPlan)
      .where('plan_name LIKE :tag', { tag: `${SEED_TAG}%` })
      .execute();
    console.log(`deleted ${deletedPlans.affected ?? 0} seed-tagged plan(s)`);

    for (const planName of LEGACY_UNTAGGED_PLAN_NAMES) {
      const plan = await planRepo.findOne({ where: { plan_name: planName } });
      if (!plan) continue;

      const contractCount = await dataSource
        .getRepository(InstituteAnnualContract)
        .count({ where: { plan: { id: plan.id } } });

      if (contractCount > 0) {
        console.log(
          `skipped legacy plan "${planName}" - still referenced by ${contractCount} contract(s)`,
        );
        continue;
      }

      await planRepo.delete({ id: plan.id } as any);
      console.log(`deleted legacy untagged plan: ${planName}`);
    }

    console.log(
      'Cleanup completed. The institute admin account was left untouched (never deleted by this script).',
    );
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Cleanup failed:');
  console.error(error);
  process.exit(1);
});
