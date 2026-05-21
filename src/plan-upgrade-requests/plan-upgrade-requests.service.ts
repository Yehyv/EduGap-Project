import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePlanUpgradeRequestDto } from './dto/create-plan-upgrade-request.dto';
import {
  PlanUpgradeRequest,
  PlanUpgradeRequestStatus,
} from './entities/plan-upgrade-request.entity';

interface CurrentContractRaw {
  contractId: number | string;
  instituteId: number | string;
  currentPlanId: number | string;
  currentPlanName: string | null;
}

interface PlanRaw {
  id: number | string;
  planName: string | null;
}

interface AuthUser {
  sub: number;
  email: string;
  instituteId: number;
  role?: string;
}

@Injectable()
export class PlanUpgradeRequestsService {
  constructor(
    @InjectRepository(PlanUpgradeRequest)
    private readonly requestRepo: Repository<PlanUpgradeRequest>,
    private readonly dataSource: DataSource,
  ) {}

  private isInstituteRole(user?: AuthUser) {
    return ['INST_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role ?? '');
  }

  async createForInstitute(dto: CreatePlanUpgradeRequestDto, user: AuthUser) {
    if (!this.isInstituteRole(user)) {
      throw new BadRequestException(
        'Only institute admins can request plan upgrade',
      );
    }

    const contractRows = await this.dataSource.query<CurrentContractRaw[]>(
      `
      SELECT
        c.id AS contractId,
        c.institute_id AS instituteId,
        c.plan_id AS currentPlanId,
        sp.plan_name AS currentPlanName
      FROM institute_annual_contracts c
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      WHERE c.institute_id = ?
        AND c.status = 'ACTIVE'
        AND c.deleted_at IS NULL
      ORDER BY c.academic_year DESC, c.id DESC
      LIMIT 1
      `,
      [user.instituteId],
    );

    const currentContract = contractRows[0];

    if (!currentContract) {
      throw new NotFoundException(
        'No active annual contract found for current institute',
      );
    }

    const requestedPlanRows = await this.dataSource.query<PlanRaw[]>(
      `
      SELECT
        id,
        plan_name AS planName
      FROM subscription_plans
      WHERE id = ?
      LIMIT 1
      `,
      [dto.requestedPlanId],
    );

    const requestedPlan = requestedPlanRows[0];

    if (!requestedPlan) {
      throw new NotFoundException('Requested plan not found');
    }

    const currentPlanId = Number(currentContract.currentPlanId);
    const requestedPlanId = Number(dto.requestedPlanId);

    if (currentPlanId === requestedPlanId) {
      throw new BadRequestException(
        'Requested plan must be different from current plan',
      );
    }

    const existingPending = await this.requestRepo.findOne({
      where: {
        instituteId: Number(user.instituteId),
        currentContractId: Number(currentContract.contractId),
        status: PlanUpgradeRequestStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException(
        'There is already a pending upgrade request for this contract',
      );
    }

    const request = this.requestRepo.create({
      instituteId: Number(user.instituteId),
      currentContractId: Number(currentContract.contractId),
      currentPlanId,
      requestedPlanId,
      reason: dto.reason.trim(),
      additionalStudentsNeeded: dto.additionalStudentsNeeded ?? null,
      message: dto.message?.trim() || null,
      status: PlanUpgradeRequestStatus.PENDING,
      reviewNotes: null,
      reviewedBy: null,
      reviewedAt: null,
    });

    const saved = await this.requestRepo.save(request);

    return {
      message: 'Upgrade request submitted successfully',
      request: {
        id: saved.id,
        instituteId: saved.instituteId,
        currentContractId: saved.currentContractId,
        currentPlanId: saved.currentPlanId,
        currentPlanName: currentContract.currentPlanName,
        requestedPlanId: saved.requestedPlanId,
        requestedPlanName: requestedPlan.planName,
        reason: saved.reason,
        additionalStudentsNeeded: saved.additionalStudentsNeeded,
        status: saved.status,
        createdAt: saved.createdAt,
      },
    };
  }
}