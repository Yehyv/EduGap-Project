import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Institute } from '../src/institutes/entities/institute.entity';
import { SystemUser } from '../src/system-users/entities/system-user.entity';
import { SubscriptionPlan } from '../src/subscription-plans/entities/subscription-plan.entity';

const PLAN_NAMES = ['Starter (Legacy)', 'Growth (Legacy)', 'Growth', 'Premium'];

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    const instituteRepo = dataSource.getRepository(Institute);
    const systemUserRepo = dataSource.getRepository(SystemUser);
    const planRepo = dataSource.getRepository(SubscriptionPlan);

    const institute = await instituteRepo.findOne({
      where: { email: 'finance.history.institute@edugap.test' },
    });

    if (institute) {
      // Detach any system users still pointing at this institute before the
      // institute row (and its cascaded contracts/installments/payments) is removed.
      await systemUserRepo.update(
        { institute: { id: institute.id } } as any,
        { institute: null } as any,
      );
      await instituteRepo.delete({ id: institute.id } as any);
      console.log(`deleted institute #${institute.id} (cascaded contracts/installments/payments)`);
    } else {
      console.log('no seeded institute found, skipping');
    }

    const deletedAdmin = await systemUserRepo.delete({
      national_id: '29801011000000',
    } as any);
    console.log(`deleted ${deletedAdmin.affected ?? 0} seeded system user(s)`);

    for (const planName of PLAN_NAMES) {
      const deletedPlan = await planRepo.delete({
        plan_name: planName,
      } as any);
      if (deletedPlan.affected) {
        console.log(`deleted plan: ${planName}`);
      }
    }

    console.log('Cleanup completed.');
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('Cleanup failed:');
  console.error(error);
  process.exit(1);
});
