import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { InstituteAnnualContract } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
interface SubscriptionPlanListRow {
  id: number | string;
  plan_name: string;
  min_students: number | string;
  max_students: number | string;
  default_price_per_student: string;
  default_installments_count: number | string;
  description: string | null;
  administrative_fees: number | string | null;
  is_active: number | string;
  institutesCount: number | string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
interface PlanInstitutesCountRow {
  institutesCount: number | string | null;
}
@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(InstituteAnnualContract)
    private readonly contractRepo: Repository<InstituteAnnualContract>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
  ) {}
  async create(dto: CreateSubscriptionPlanDto, createdById?: number) {
    if (dto.max_students < dto.min_students) {
      throw new BadRequestException(
        'max_students must be greater than or equal to min_students',
      );
    }

    const createdBy = createdById
      ? await this.systemUserRepo.findOne({
          where: { id: createdById },
          select: {
            id: true,
            full_name: true,
          },
        })
      : null;

    if (createdById && !createdBy) {
      throw new NotFoundException(
        `System user with id ${createdById} not found`,
      );
    }

    const plan = this.planRepo.create({
      plan_name: dto.plan_name.trim(),
      min_students: dto.min_students,
      max_students: dto.max_students,
      default_price_per_student: dto.default_price_per_student,
      default_installments_count: dto.default_installments_count,
      description: dto.description?.trim() || null,
      createdBy: createdBy ?? undefined,
      is_active: 1,
      administrative_fees: dto.administrative_fees,
    });

    const savedPlan = await this.planRepo.save(plan);

    return {
      ...savedPlan,
      createdBy: createdBy
        ? {
            id: createdBy.id,
            full_name: createdBy.full_name,
          }
        : null,
    };
  }

  async findAll(onlyActiveRaw?: string) {
    const onlyActive =
      onlyActiveRaw === undefined
        ? false
        : ['1', 'true', 'yes'].includes(onlyActiveRaw.toLowerCase());

    const qb = this.planRepo
      .createQueryBuilder('plan')
      .leftJoin(
        'plan.contracts',
        'contract',
        `
      contract.deleted_at IS NULL
      AND contract.status <> :cancelledStatus
      `,
        { cancelledStatus: 'CANCELLED' },
      )
      .where('plan.deleted_at IS NULL');

    if (onlyActive) {
      qb.andWhere('plan.is_active = :isActive', { isActive: 1 });
    }

    const rows = await qb
      .select('plan.id', 'id')
      .addSelect('plan.plan_name', 'plan_name')
      .addSelect('plan.min_students', 'min_students')
      .addSelect('plan.max_students', 'max_students')
      .addSelect('plan.default_price_per_student', 'default_price_per_student')
      .addSelect(
        'plan.default_installments_count',
        'default_installments_count',
      )
      .addSelect('plan.description', 'description')
      .addSelect('plan.administrative_fees', 'administrative_fees')
      .addSelect('plan.is_active', 'is_active')
      .addSelect('plan.created_at', 'created_at')
      .addSelect('plan.updated_at', 'updated_at')
      .addSelect('plan.deleted_at', 'deleted_at')
      .addSelect('COUNT(DISTINCT contract.institute)', 'institutesCount')
      .groupBy('plan.id')
      .addGroupBy('plan.plan_name')
      .addGroupBy('plan.min_students')
      .addGroupBy('plan.max_students')
      .addGroupBy('plan.default_price_per_student')
      .addGroupBy('plan.default_installments_count')
      .addGroupBy('plan.description')
      .addGroupBy('plan.administrative_fees')
      .addGroupBy('plan.is_active')
      .addGroupBy('plan.created_at')
      .addGroupBy('plan.updated_at')
      .addGroupBy('plan.deleted_at')
      .orderBy('plan.id', 'DESC')
      .getRawMany<SubscriptionPlanListRow>();

    return rows.map((row) => ({
      id: Number(row.id),
      plan_name: row.plan_name,
      min_students: Number(row.min_students),
      max_students: Number(row.max_students),
      default_price_per_student: Number(row.default_price_per_student),
      default_installments_count: Number(row.default_installments_count),
      description: row.description,
      administrative_fees: Number(row.administrative_fees ?? 0),
      is_active: Number(row.is_active),
      institutesCount: Number(row.institutesCount ?? 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
    }));
  }

  async findOne(id: number) {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with id ${id} not found`);
    }

    const countRow = await this.planRepo
      .createQueryBuilder('plan')
      .leftJoin(
        'plan.contracts',
        'contract',
        `
      contract.deleted_at IS NULL
      AND contract.status <> :cancelledStatus
      `,
        { cancelledStatus: 'CANCELLED' },
      )
      .leftJoin('contract.institute', 'institute')
      .where('plan.id = :id', { id })
      .select('COUNT(DISTINCT institute.id)', 'institutesCount')
      .getRawOne<PlanInstitutesCountRow>();

    const { createdBy, ...planData } = plan;

    return {
      ...planData,
      institutesCount: Number(countRow?.institutesCount ?? 0),
      createdBy: createdBy
        ? {
            id: createdBy.id,
            full_name: createdBy.full_name,
          }
        : null,
    };
  }

  async update(id: number, dto: UpdateSubscriptionPlanDto) {
    const plan = await this.findOne(id);

    if (
      dto.min_students !== undefined &&
      dto.max_students !== undefined &&
      dto.max_students < dto.min_students
    ) {
      throw new BadRequestException(
        'max_students must be greater than or equal to min_students',
      );
    }

    if (dto.plan_name !== undefined) plan.plan_name = dto.plan_name.trim();
    if (dto.min_students !== undefined) plan.min_students = dto.min_students;
    if (dto.max_students !== undefined) plan.max_students = dto.max_students;
    if (dto.default_price_per_student !== undefined) {
      plan.default_price_per_student = dto.default_price_per_student;
    }
    if (dto.default_installments_count !== undefined) {
      plan.default_installments_count = dto.default_installments_count;
    }
    if (dto.description !== undefined) {
      plan.description = dto.description?.trim() || null;
    }
    if (dto.administrative_fees !== undefined) {
      plan.administrative_fees = dto.administrative_fees;
    }
    if (dto.is_active !== undefined) plan.is_active = dto.is_active;

    return this.planRepo.save(plan);
  }

  async toggleStatus(id: number) {
    const plan = await this.planRepo.findOne({
      where: {
        id,
        deleted_at: IsNull(),
      },
      relations: ['createdBy'],
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with id ${id} not found`);
    }

    plan.is_active = plan.is_active === 1 ? 0 : 1;

    const savedPlan = await this.planRepo.save(plan);

    return {
      message:
        savedPlan.is_active === 1
          ? 'Subscription plan activated'
          : 'Subscription plan deactivated',
      plan: {
        ...savedPlan,
        createdBy: savedPlan.createdBy
          ? {
              id: savedPlan.createdBy.id,
              full_name: savedPlan.createdBy.full_name,
            }
          : null,
      },
    };
  }

  async getInstitutesUsingPlan(id: number, languageId?: number) {
    await this.findOne(id);

    const contracts = await this.contractRepo.find({
      where: { plan: { id } },
      relations: [
        'institute',
        'institute.translations',
        'institute.translations.language',
        'plan',
      ],
      order: { id: 'DESC' },
    });

    const institutes = new Map<number, unknown>();

    for (const contract of contracts) {
      const institute = contract.institute;
      if (!institute || institutes.has(institute.id)) continue;

      const selectedTranslation =
        institute.translations?.find((tr) => tr.language?.id === languageId) ||
        institute.translations?.[0];

      institutes.set(institute.id, {
        instituteId: institute.id,
        instituteName:
          selectedTranslation?.name || `Institute #${institute.id}`,
        latestContractId: contract.id,
        academicYear: contract.academic_year,
        contractStatus: contract.status,
      });
    }

    return {
      planId: id,
      institutes: Array.from(institutes.values()),
    };
  }
}
