import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePlanUpgradeRequestDto } from './dto/create-plan-upgrade-request.dto';
import { FindPlanUpgradeRequestsQueryDto } from './dto/find-plan-upgrade-requests-query.dto';
import {
  ApprovePlanUpgradeRequestDto,
  RejectPlanUpgradeRequestDto,
} from './dto/review-plan-upgrade-request.dto';
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

export interface PlanUpgradeRequestRow {
  id: number;
  instituteId: number;
  instituteName: string;
  currentContractId: number;
  currentPlanId: number;
  currentPlanName: string | null;
  requestedPlanId: number;
  requestedPlanName: string | null;
  reason: string;
  additionalStudentsNeeded: number | null;
  message: string | null;
  status: PlanUpgradeRequestStatus;
  reviewNotes: string | null;
  reviewedBy: number | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

  private readonly reviewRowSql = `
    SELECT
      r.id,
      r.institute_id AS instituteId,
      COALESCE(
        (SELECT it.name FROM institute_translation it WHERE it.instituteId = r.institute_id LIMIT 1),
        CONCAT('Institute #', r.institute_id)
      ) AS instituteName,
      r.current_contract_id AS currentContractId,
      r.current_plan_id AS currentPlanId,
      cp.plan_name AS currentPlanName,
      r.requested_plan_id AS requestedPlanId,
      rp.plan_name AS requestedPlanName,
      r.reason,
      r.additional_students_needed AS additionalStudentsNeeded,
      r.message,
      r.status,
      r.review_notes AS reviewNotes,
      r.reviewed_by AS reviewedBy,
      r.reviewed_at AS reviewedAt,
      r.created_at AS createdAt,
      r.updated_at AS updatedAt
    FROM plan_upgrade_requests r
    LEFT JOIN subscription_plans cp ON cp.id = r.current_plan_id
    LEFT JOIN subscription_plans rp ON rp.id = r.requested_plan_id
  `;

  async findAllForReview(query: FindPlanUpgradeRequestsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (query.status) {
      conditions.push('r.status = ?');
      params.push(query.status);
    }

    if (query.instituteId) {
      conditions.push('r.institute_id = ?');
      params.push(query.instituteId);
    }

    const whereSql = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const rows = await this.dataSource.query<PlanUpgradeRequestRow[]>(
      `${this.reviewRowSql} ${whereSql} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const countRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(`SELECT COUNT(*) AS total FROM plan_upgrade_requests r ${whereSql}`, params);

    const total = Number(countRows[0]?.total || 0);

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        pages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  async findOneForReview(id: number): Promise<PlanUpgradeRequestRow> {
    const rows = await this.dataSource.query<PlanUpgradeRequestRow[]>(
      `${this.reviewRowSql} WHERE r.id = ? LIMIT 1`,
      [id],
    );

    if (!rows.length) {
      throw new NotFoundException('Plan upgrade request not found');
    }

    return rows[0];
  }

  async approve(
    id: number,
    reviewerId: number,
    dto: ApprovePlanUpgradeRequestDto,
  ) {
    const request = await this.requestRepo.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException('Plan upgrade request not found');
    }

    if (request.status !== PlanUpgradeRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    request.status = PlanUpgradeRequestStatus.APPROVED;
    request.reviewNotes = dto.reviewNotes?.trim() || null;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();

    await this.requestRepo.save(request);

    return {
      message: 'Plan upgrade request approved successfully',
      request: await this.findOneForReview(id),
    };
  }

  async reject(
    id: number,
    reviewerId: number,
    dto: RejectPlanUpgradeRequestDto,
  ) {
    const request = await this.requestRepo.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException('Plan upgrade request not found');
    }

    if (request.status !== PlanUpgradeRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    request.status = PlanUpgradeRequestStatus.REJECTED;
    request.reviewNotes = dto.reviewNotes.trim();
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();

    await this.requestRepo.save(request);

    return {
      message: 'Plan upgrade request rejected successfully',
      request: await this.findOneForReview(id),
    };
  }
}
