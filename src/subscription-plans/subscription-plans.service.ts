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
      ? await this.systemUserRepo.findOne({ where: { id: createdById } })
      : null;

    const plan = this.planRepo.create({
      plan_name: dto.plan_name.trim(),
      min_students: dto.min_students,
      max_students: dto.max_students,
      default_price_per_student: dto.default_price_per_student,
      default_installments_count: dto.default_installments_count,
      description: dto.description?.trim() || null,
      createdBy,
      is_active: 1,
      administrative_fees: dto.administrative_fees,
    });

    return this.planRepo.save(plan);
  }

  async findAll(onlyActiveRaw?: string) {
    const onlyActive =
      onlyActiveRaw === undefined
        ? false
        : ['1', 'true', 'yes'].includes(onlyActiveRaw.toLowerCase());

    return this.planRepo.find({
      where: onlyActive ? { is_active: 1, deleted_at: IsNull() } : {},
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with id ${id} not found`);
    }

    return plan;
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

  async setActive(id: number, isActive: 0 | 1) {
    const plan = await this.findOne(id);
    plan.is_active = isActive;
    const saved = await this.planRepo.save(plan);

    return {
      message: isActive
        ? 'Subscription plan activated'
        : 'Subscription plan deactivated',
      plan: saved,
    };
  }

  async getInstitutesUsingPlan(id: number, languageId?: number) {
    await this.findOne(id);

    const contracts = await this.contractRepo.find({
      where: { plan: { id } },
      relations: ['institute', 'institute.translations', 'plan'],
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
