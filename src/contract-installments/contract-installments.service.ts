import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContractStatus,
  InstituteAnnualContract,
} from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { PaymentStatus } from 'src/contract-payments/entities/contract-payment.entity';
import { GenerateInstallmentsDto } from './dto/generate-installments.dto';
import { UpdateContractInstallmentDto } from './dto/update-contract-installment.dto';
import {
  ContractInstallment,
  InstallmentStatus,
} from './entities/contract-installment.entity';
import { Brackets } from 'typeorm';
import { FindContractInstallmentsQueryDto } from './dto/find-contract-installments-query.dto';

export interface InstallmentPreviewItem {
  installmentNo: number;
  dueDate: string;
  installmentAmount: number;
  installmentPercentage: number;
}

export interface PreviewInstallmentsResponse {
  contractId: number;
  totalAmount: number;
  installmentsCount: number;
  installments: InstallmentPreviewItem[];
}
type LinkedPaymentRaw = {
  paymentId: number;
};

type InstallmentSummaryRaw = {
  totalInstallments: string | number;
  totalInstallmentsAmount: string | number;
  paidAmount: string | number;
  remainingAmount: string | number;
  paidInstallments: string | number;
  partialInstallments: string | number;
  pendingInstallments: string | number;
  overdueInstallments: string | number;
};

type RecalculateInstallmentRaw = {
  id: number;
  installmentAmount: string | number;
  dueDate: string;
  paidAmount: string | number;
};
type AuthUser = {
  sub: number;
  email: string;
  instituteId: number;
  role?: string;
};

@Injectable()
export class ContractInstallmentsService {
  constructor(
    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,

    @InjectRepository(InstituteAnnualContract)
    private readonly contractRepo: Repository<InstituteAnnualContract>,
  ) {}
  private isInstituteRole(user?: AuthUser) {
    return ['INST_ADMIN', 'INSTITUTE_ADMIN'].includes(user?.role ?? '');
  }

  private assertInstituteScope(
    contract: InstituteAnnualContract,
    user?: AuthUser,
  ) {
    if (!user || !this.isInstituteRole(user)) return;

    const contractInstituteId = Number((contract as any).institute?.id);

    if (
      !contractInstituteId ||
      contractInstituteId !== Number(user.instituteId)
    ) {
      throw new ForbiddenException(
        'You are not allowed to access installments for this institute',
      );
    }
  }

  private mapInstallmentResponse(installment: ContractInstallment) {
    const payments = installment.payments ?? [];

    const confirmedPayments = payments.filter(
      (payment) => payment.status === PaymentStatus.CONFIRMED,
    );

    const paymentHistory = confirmedPayments.map((payment) => ({
      id: payment.id,
      paymentId: payment.id,
      paymentDate: payment.payment_date,
      amount: Number(payment.paid_amount || 0),
      paidAmount: Number(payment.paid_amount || 0),
      paymentMethod: payment.payment_method,
      receiptNo: payment.receipt_no,
      receiptFile: payment.receipt_file,
      status: payment.status,
      notes: payment.notes,
      createdAt: payment.created_at,
    }));

    const contract = installment.contract;

    const institute = contract?.institute;

    const instituteName =
      institute?.translations?.[0]?.name ?? institute?.email ?? null;

    return {
      id: installment.id,
      installmentId: installment.id,

      contractId: contract?.id ?? null,
      contractNo: contract
        ? `CON-${contract.academic_year}-${String(contract.id).padStart(3, '0')}`
        : null,

      instituteId: institute?.id ?? null,
      instituteName,

      year: contract?.academic_year ?? null,

      installmentNo: installment.installment_no,
      dueDate: installment.due_date,
      installmentPercentage: Number(installment.installment_percentage || 0),
      installmentAmount: Number(installment.installment_amount || 0),
      paidAmount: Number(installment.paid_amount || 0),
      remainingAmount: Number(installment.remaining_amount || 0),
      status: installment.status,
      notes: installment.notes,

      paymentsCount: paymentHistory.length,
      paymentHistory,

      createdAt: installment.created_at,
      updatedAt: installment.updated_at,
    };
  }

  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const expectedMonth = result.getMonth() + months;

    result.setMonth(expectedMonth);

    if (result.getMonth() !== ((expectedMonth % 12) + 12) % 12) {
      result.setDate(0);
    }

    return result;
  }

  private resolveInstallmentStatus(
    dueDate: string,
    installmentAmount: number,
    paidAmount: number,
  ): InstallmentStatus {
    const amount = this.round2(installmentAmount);
    const paid = this.round2(paidAmount);
    const remaining = this.round2(Math.max(amount - paid, 0));

    if (remaining <= 0 || paid >= amount) {
      return InstallmentStatus.PAID;
    }

    if (paid > 0) {
      return InstallmentStatus.PARTIAL;
    }

    const today = this.toDateOnly(new Date());

    if (dueDate < today) {
      return InstallmentStatus.OVERDUE;
    }

    return InstallmentStatus.PENDING;
  }

  private validateInstallmentGenerationContract(
    contract: InstituteAnnualContract,
  ): void {
    if (
      [ContractStatus.CANCELLED, ContractStatus.CLOSED].includes(
        contract.status,
      )
    ) {
      throw new BadRequestException(
        'Cannot generate installments for closed or cancelled contract',
      );
    }

    if (
      !contract.installments_count ||
      Number(contract.installments_count) < 1
    ) {
      throw new BadRequestException(
        'Contract installments count must be greater than zero',
      );
    }

    if (!contract.total_amount || Number(contract.total_amount) <= 0) {
      throw new BadRequestException(
        'Contract total amount must be greater than zero',
      );
    }
  }

  private buildInstallmentsPreview(
    contract: InstituteAnnualContract,
    dto: GenerateInstallmentsDto,
  ): InstallmentPreviewItem[] {
    this.validateInstallmentGenerationContract(contract);

    const count = Number(contract.installments_count);
    const total = Number(contract.total_amount);

    const baseAmount = this.round2(total / count);
    const basePercentage = this.round2(100 / count);

    const firstDueDate = dto.firstDueDate
      ? new Date(dto.firstDueDate)
      : contract.contract_start_date
        ? new Date(contract.contract_start_date)
        : new Date();

    const intervalMonths = dto.intervalMonths ?? 1;

    const preview: InstallmentPreviewItem[] = [];
    let accumulatedAmount = 0;
    let accumulatedPercentage = 0;

    for (let i = 1; i <= count; i++) {
      const installmentAmount =
        i === count ? this.round2(total - accumulatedAmount) : baseAmount;

      const installmentPercentage =
        i === count ? this.round2(100 - accumulatedPercentage) : basePercentage;

      accumulatedAmount = this.round2(accumulatedAmount + installmentAmount);

      accumulatedPercentage = this.round2(
        accumulatedPercentage + installmentPercentage,
      );

      preview.push({
        installmentNo: i,
        dueDate: this.toDateOnly(
          this.addMonths(firstDueDate, (i - 1) * intervalMonths),
        ),
        installmentAmount,
        installmentPercentage,
      });
    }

    return preview;
  }

  private async getContractOrFail(
    contractId: number,
    withRelations = false,
  ): Promise<InstituteAnnualContract> {
    const qb = this.contractRepo
      .createQueryBuilder('contract')
      .where('contract.id = :contractId', { contractId });

    if (withRelations) {
      qb.leftJoinAndSelect('contract.institute', 'institute');
      qb.leftJoinAndSelect('contract.plan', 'plan');
    }

    const contract = await qb.getOne();

    if (!contract) {
      throw new NotFoundException('Annual contract not found');
    }

    return contract;
  }

  async getGenerateInfo(contractId: number): Promise<any> {
    const contract = await this.getContractOrFail(contractId, true);

    const existingInstallments = await this.installmentRepo
      .createQueryBuilder('installment')
      .where('installment.contract_id = :contractId', { contractId })
      .getCount();

    return {
      contractId: contract.id,
      contractNo: `CON-${contract.academic_year}-${String(contract.id).padStart(3, '0')}`,
      institute: contract.institute,
      year: contract.academic_year,
      plan: contract.plan,
      totalAmount: Number(contract.total_amount || 0),
      installmentsCount: Number(contract.installments_count || 0),
      contractStartDate: contract.contract_start_date,
      contractEndDate: contract.contract_end_date,
      status: contract.status,
      hasInstallments: existingInstallments > 0,
      existingInstallments,
    };
  }

  async preview(
    contractId: number,
    dto: GenerateInstallmentsDto,
  ): Promise<PreviewInstallmentsResponse> {
    const contract = await this.getContractOrFail(contractId, true);

    const installments = this.buildInstallmentsPreview(contract, dto);

    return {
      contractId,
      totalAmount: Number(contract.total_amount || 0),
      installmentsCount: Number(contract.installments_count || 0),
      installments,
    };
  }

  async generate(
    contractId: number,
    dto: GenerateInstallmentsDto,
  ): Promise<any> {
    const contract = await this.getContractOrFail(contractId, false);

    this.validateInstallmentGenerationContract(contract);

    const existing = await this.installmentRepo
      .createQueryBuilder('installment')
      .where('installment.contract_id = :contractId', { contractId })
      .getCount();

    if (existing > 0 && !dto.force) {
      throw new BadRequestException(
        'Installments already exist. Pass force=true to regenerate.',
      );
    }

    if (existing > 0 && dto.force) {
      const linkedPayment = await this.installmentRepo
        .createQueryBuilder('installment')
        .innerJoin('installment.payments', 'payment')
        .where('installment.contract_id = :contractId', { contractId })
        .select('payment.id', 'paymentId')
        .limit(1)
        .getRawOne<LinkedPaymentRaw>();

      if (linkedPayment) {
        throw new BadRequestException(
          'Cannot regenerate installments because payments are already linked to this contract installments.',
        );
      }

      await this.installmentRepo
        .createQueryBuilder()
        .delete()
        .from(ContractInstallment)
        .where('contract_id = :contractId', { contractId })
        .execute();
    }

    const preview = this.buildInstallmentsPreview(contract, dto);

    const installments = preview.map((item) =>
      this.installmentRepo.create({
        contract,
        installment_no: item.installmentNo,
        due_date: item.dueDate,
        installment_percentage: item.installmentPercentage,
        installment_amount: item.installmentAmount,
        paid_amount: 0,
        remaining_amount: item.installmentAmount,
        status: this.resolveInstallmentStatus(
          item.dueDate,
          item.installmentAmount,
          0,
        ),
        notes: null,
      }),
    );

    const saved = await this.installmentRepo.save(installments);

    return {
      message: 'Installments generated successfully',
      contractId,
      installmentsCount: Number(contract.installments_count),
      installments: saved,
    };
  }

  async findAll(query: FindContractInstallmentsQueryDto, user?: AuthUser) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 10), 100);
    const skip = (page - 1) * limit;

    const qb = this.installmentRepo
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.contract', 'contract')
      .leftJoinAndSelect('contract.institute', 'institute')
      .leftJoinAndSelect('institute.translations', 'instituteTranslation')
      .leftJoinAndSelect('installment.payments', 'payment');

    if (this.isInstituteRole(user)) {
      qb.andWhere('institute.id = :userInstituteId', {
        userInstituteId: user?.instituteId,
      });
    } else if (query.instituteId) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: query.instituteId,
      });
    }

    if (query.contractId) {
      qb.andWhere('contract.id = :contractId', {
        contractId: query.contractId,
      });
    }

    if (query.year) {
      qb.andWhere('contract.academic_year = :year', {
        year: query.year,
      });
    }

    if (query.status) {
      qb.andWhere('installment.status = :status', {
        status: query.status,
      });
    }

    if (query.dueFrom) {
      qb.andWhere('installment.due_date >= :dueFrom', {
        dueFrom: query.dueFrom,
      });
    }

    if (query.dueTo) {
      qb.andWhere('installment.due_date <= :dueTo', {
        dueTo: query.dueTo,
      });
    }

    if (query.minAmount !== undefined) {
      qb.andWhere('installment.installment_amount >= :minAmount', {
        minAmount: query.minAmount,
      });
    }

    if (query.maxAmount !== undefined) {
      qb.andWhere('installment.installment_amount <= :maxAmount', {
        maxAmount: query.maxAmount,
      });
    }

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;

      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('installment.notes LIKE :search', { search })
            .orWhere('installment.installment_no LIKE :search', { search })
            .orWhere('instituteTranslation.name LIKE :search', { search });
        }),
      );
    }

    const sortMap: Record<string, string> = {
      installmentNo: 'installment.installment_no',
      dueDate: 'installment.due_date',
      amount: 'installment.installment_amount',
      paidAmount: 'installment.paid_amount',
      remainingAmount: 'installment.remaining_amount',
      status: 'installment.status',
    };

    const sortBy = sortMap[query.sortBy ?? 'installmentNo'];
    const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC';

    qb.orderBy(sortBy, sortOrder).skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const summaryQb = this.installmentRepo
      .createQueryBuilder('installment')
      .leftJoin('installment.contract', 'contract')
      .leftJoin('contract.institute', 'institute')
      .select('COUNT(installment.id)', 'totalInstallments')
      .addSelect(
        'COALESCE(SUM(installment.installment_amount), 0)',
        'totalInstallmentsAmount',
      )
      .addSelect('COALESCE(SUM(installment.paid_amount), 0)', 'paidAmount')
      .addSelect(
        'COALESCE(SUM(installment.remaining_amount), 0)',
        'remainingAmount',
      );

    if (this.isInstituteRole(user)) {
      summaryQb.andWhere('institute.id = :userInstituteId', {
        userInstituteId: user?.instituteId,
      });
    } else if (query.instituteId) {
      summaryQb.andWhere('institute.id = :instituteId', {
        instituteId: query.instituteId,
      });
    }

    if (query.contractId) {
      summaryQb.andWhere('contract.id = :contractId', {
        contractId: query.contractId,
      });
    }

    if (query.year) {
      summaryQb.andWhere('contract.academic_year = :year', {
        year: query.year,
      });
    }

    if (query.status) {
      summaryQb.andWhere('installment.status = :status', {
        status: query.status,
      });
    }

    if (query.dueFrom) {
      summaryQb.andWhere('installment.due_date >= :dueFrom', {
        dueFrom: query.dueFrom,
      });
    }

    if (query.dueTo) {
      summaryQb.andWhere('installment.due_date <= :dueTo', {
        dueTo: query.dueTo,
      });
    }

    if (query.minAmount !== undefined) {
      summaryQb.andWhere('installment.installment_amount >= :minAmount', {
        minAmount: query.minAmount,
      });
    }

    if (query.maxAmount !== undefined) {
      summaryQb.andWhere('installment.installment_amount <= :maxAmount', {
        maxAmount: query.maxAmount,
      });
    }

    const summary = await summaryQb.getRawOne<{
      totalInstallments: string;
      totalInstallmentsAmount: string;
      paidAmount: string;
      remainingAmount: string;
    }>();

    return {
      data: items.map((installment) =>
        this.mapInstallmentResponse(installment),
      ),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        count: items.length,
      },
      summary: {
        totalInstallments: Number(summary?.totalInstallments || 0),
        totalInstallmentsAmount: Number(summary?.totalInstallmentsAmount || 0),
        paidAmount: Number(summary?.paidAmount || 0),
        remainingAmount: Number(summary?.remainingAmount || 0),
      },
    };
  }

  async findByContract(contractId: number, user?: AuthUser) {
    return this.findAll({ contractId, page: 1, limit: 100 }, user);
  }

  async findOne(id: number, user?: AuthUser) {
    const installment = await this.installmentRepo.findOne({
      where: { id },
      relations: [
        'contract',
        'contract.institute',
        'contract.institute.translations',
        'payments',
        'payments.createdBy',
      ],
    });

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    this.assertInstituteScope(installment.contract, user);

    return this.mapInstallmentResponse(installment);
  }

  async summary(contractId: number, user?: AuthUser): Promise<any> {
    const contract = await this.getContractOrFail(contractId, true);

    this.assertInstituteScope(contract, user);

    const row = await this.installmentRepo
      .createQueryBuilder('installment')
      .select('COUNT(installment.id)', 'totalInstallments')
      .addSelect(
        'COALESCE(SUM(installment.installment_amount), 0)',
        'totalInstallmentsAmount',
      )
      .addSelect('COALESCE(SUM(installment.paid_amount), 0)', 'paidAmount')
      .addSelect(
        'COALESCE(SUM(installment.remaining_amount), 0)',
        'remainingAmount',
      )
      .addSelect(
        `SUM(CASE WHEN installment.status = :paid THEN 1 ELSE 0 END)`,
        'paidInstallments',
      )
      .addSelect(
        `SUM(CASE WHEN installment.status = :partial THEN 1 ELSE 0 END)`,
        'partialInstallments',
      )
      .addSelect(
        `SUM(CASE WHEN installment.status = :pending THEN 1 ELSE 0 END)`,
        'pendingInstallments',
      )
      .addSelect(
        `SUM(CASE WHEN installment.status = :overdue THEN 1 ELSE 0 END)`,
        'overdueInstallments',
      )
      .where('installment.contract_id = :contractId', { contractId })
      .setParameters({
        paid: InstallmentStatus.PAID,
        partial: InstallmentStatus.PARTIAL,
        pending: InstallmentStatus.PENDING,
        overdue: InstallmentStatus.OVERDUE,
      })
      .getRawOne<InstallmentSummaryRaw>();

    return {
      contractId,
      totalAmount: Number(contract.total_amount || 0),
      installmentsCount: Number(contract.installments_count || 0),
      totalInstallments: Number(row?.totalInstallments || 0),
      totalInstallmentsAmount: this.round2(
        Number(row?.totalInstallmentsAmount || 0),
      ),
      paidAmount: this.round2(Number(row?.paidAmount || 0)),
      remainingAmount: this.round2(Number(row?.remainingAmount || 0)),
      paidPercentage: Number(contract.payment_percentage || 0),
      paidInstallments: Number(row?.paidInstallments || 0),
      partialInstallments: Number(row?.partialInstallments || 0),
      pendingInstallments: Number(row?.pendingInstallments || 0),
      overdueInstallments: Number(row?.overdueInstallments || 0),
    };
  }

  async details(id: number): Promise<any> {
    const installment = await this.installmentRepo
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.contract', 'contract')
      .leftJoinAndSelect('contract.institute', 'institute')
      .leftJoinAndSelect('contract.plan', 'plan')
      .leftJoinAndSelect('installment.payments', 'payment')
      .leftJoinAndSelect('payment.createdBy', 'createdBy')
      .leftJoinAndSelect('payment.cancelledBy', 'cancelledBy')
      .where('installment.id = :id', { id })
      .getOne();

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    const amount = Number(installment.installment_amount || 0);
    const paid = Number(installment.paid_amount || 0);
    const paidPercentage = amount > 0 ? this.round2((paid / amount) * 100) : 0;

    return {
      contract: {
        id: installment.contract.id,
        contractNo: `CON-${installment.contract.academic_year}-${String(
          installment.contract.id,
        ).padStart(3, '0')}`,
        institute: installment.contract.institute,
        year: installment.contract.academic_year,
        plan: installment.contract.plan,
      },
      installment: {
        id: installment.id,
        installmentNo: installment.installment_no,
        dueDate: installment.due_date,
        installmentPercentage: Number(installment.installment_percentage || 0),
        installmentAmount: Number(installment.installment_amount || 0),
        paidAmount: Number(installment.paid_amount || 0),
        remainingAmount: Number(installment.remaining_amount || 0),
        paidPercentage,
        status: installment.status,
        notes: installment.notes,
      },
      payments: (installment.payments || []).sort((a, b) => b.id - a.id),
    };
  }

  async update(
    id: number,
    dto: UpdateContractInstallmentDto,
  ): Promise<ContractInstallment> {
    const installment = await this.installmentRepo
      .createQueryBuilder('installment')
      .leftJoinAndSelect('installment.contract', 'contract')
      .where('installment.id = :id', { id })
      .getOne();

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    if (dto.dueDate !== undefined) {
      installment.due_date = dto.dueDate;
    }

    if (dto.installmentAmount !== undefined) {
      installment.installment_amount = dto.installmentAmount;

      const remaining =
        Number(dto.installmentAmount) - Number(installment.paid_amount || 0);

      installment.remaining_amount = this.round2(Math.max(remaining, 0));
    }

    if (dto.installmentPercentage !== undefined) {
      installment.installment_percentage = dto.installmentPercentage;
    }

    if (dto.notes !== undefined) {
      installment.notes = dto.notes?.trim() || null;
    }

    installment.status =
      dto.status ??
      this.resolveInstallmentStatus(
        installment.due_date,
        Number(installment.installment_amount || 0),
        Number(installment.paid_amount || 0),
      );

    return this.installmentRepo.save(installment);
  }

  async upcoming(days = 15): Promise<any[]> {
    const safeDays = Math.min(Math.max(Number(days) || 15, 1), 365);

    return this.installmentRepo
      .createQueryBuilder('installment')
      .innerJoin('installment.contract', 'contract')
      .innerJoin('contract.institute', 'institute')
      .select('installment.id', 'installmentId')
      .addSelect('installment.installment_no', 'installmentNo')
      .addSelect('installment.due_date', 'dueDate')
      .addSelect('installment.installment_amount', 'installmentAmount')
      .addSelect('installment.paid_amount', 'paidAmount')
      .addSelect('installment.remaining_amount', 'remainingAmount')
      .addSelect('installment.status', 'status')
      .addSelect('contract.id', 'contractId')
      .addSelect('contract.academic_year', 'academicYear')
      .addSelect('institute.id', 'instituteId')
      .addSelect('DATEDIFF(installment.due_date, CURDATE())', 'daysRemaining')
      .where('installment.status IN (:...statuses)', {
        statuses: [InstallmentStatus.PENDING, InstallmentStatus.PARTIAL],
      })
      .andWhere('installment.remaining_amount > 0')
      .andWhere(
        'installment.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :days DAY)',
        {
          days: safeDays,
        },
      )
      .orderBy('installment.due_date', 'ASC')
      .getRawMany();
  }

  async overdue(): Promise<any[]> {
    return this.installmentRepo
      .createQueryBuilder('installment')
      .innerJoin('installment.contract', 'contract')
      .innerJoin('contract.institute', 'institute')
      .select('installment.id', 'installmentId')
      .addSelect('installment.installment_no', 'installmentNo')
      .addSelect('installment.due_date', 'dueDate')
      .addSelect('installment.installment_amount', 'installmentAmount')
      .addSelect('installment.paid_amount', 'paidAmount')
      .addSelect('installment.remaining_amount', 'remainingAmount')
      .addSelect('installment.status', 'status')
      .addSelect('contract.id', 'contractId')
      .addSelect('contract.academic_year', 'academicYear')
      .addSelect('institute.id', 'instituteId')
      .addSelect('DATEDIFF(CURDATE(), installment.due_date)', 'overdueDays')
      .where('installment.status IN (:...statuses)', {
        statuses: [
          InstallmentStatus.PENDING,
          InstallmentStatus.PARTIAL,
          InstallmentStatus.OVERDUE,
        ],
      })
      .andWhere('installment.remaining_amount > 0')
      .andWhere('installment.due_date < CURDATE()')
      .orderBy('installment.due_date', 'ASC')
      .getRawMany();
  }

  async recalculateInstallment(id: number): Promise<void> {
    const row = await this.installmentRepo
      .createQueryBuilder('installment')
      .leftJoin(
        'installment.payments',
        'payment',
        'payment.status = :confirmed',
        { confirmed: PaymentStatus.CONFIRMED },
      )
      .select('installment.id', 'id')
      .addSelect('installment.installment_amount', 'installmentAmount')
      .addSelect('installment.due_date', 'dueDate')
      .addSelect('COALESCE(SUM(payment.paid_amount), 0)', 'paidAmount')
      .where('installment.id = :id', { id })
      .groupBy('installment.id')
      .addGroupBy('installment.installment_amount')
      .addGroupBy('installment.due_date')
      .getRawOne<RecalculateInstallmentRaw>();

    if (!row) {
      return;
    }

    if (!row) {
      return;
    }

    const amount = Number(row.installmentAmount || 0);
    const paid = this.round2(Number(row.paidAmount || 0));
    const remaining = this.round2(Math.max(amount - paid, 0));

    const status = this.resolveInstallmentStatus(row.dueDate, amount, paid);

    await this.installmentRepo
      .createQueryBuilder()
      .update(ContractInstallment)
      .set({
        paid_amount: paid,
        remaining_amount: remaining,
        status,
      })
      .where('id = :id', { id })
      .execute();
  }
}
