import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, SelectQueryBuilder } from 'typeorm';
import { ContractInstallment } from 'src/contract-installments/entities/contract-installment.entity';
import {
  ContractPayment,
  PaymentStatus,
} from 'src/contract-payments/entities/contract-payment.entity';
import { Institute } from 'src/institutes/entities/institute.entity';
import { SubscriptionPlan } from 'src/subscription-plans/entities/subscription-plan.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { CalculateContractDto } from './dto/calculate-contract.dto';
import { CreateInstituteAnnualContractDto } from './dto/create-institute-annual-contract.dto';
import { UpdateInstituteAnnualContractDto } from './dto/update-institute-annual-contract.dto';
import {
  ContractStatus,
  DiscountType,
  InstituteAnnualContract,
} from './entities/institute-annual-contract.entity';

interface FindContractsFilters {
  requesterRole?: string;
  requesterInstituteId?: number;
  selectedInstituteId?: number;
  academicYear?: number;
  planId?: number;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  languageId?: number;
}

interface ContractListRawRow {
  id: number | string;
  instituteId: number | string | null;
  instituteName: string | null;
  planId: number | string | null;
  planName: string | null;
  academicYear: number | string;
  maxStudentsAllowed: number | string;
  pricePerStudent: number | string;
  packageAmount: number | string;
  totalAmount: number | string;
  paidAmount: number | string | null;
  paymentPercentage: number | string | null;
  installmentsCount: number | string;
  status: ContractStatus | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ContractDetailsRawRow extends ContractListRawRow {
  contractStartDate: string | null;
  contractEndDate: string | null;
  discountType: DiscountType | string;
  discountValue: number | string;
  discountAmount: number | string;
  amountAfterDiscount: number | string;
  administrativeFees: number | string;
  taxPercentage: number | string;
  taxAmount: number | string;
  notes: string | null;
  createdById: number | string | null;
  createdByName: string | null;
  createdByRole: string | null;
  addedStudents: number | string | null;
  remainingStudents: number | string | null;
  totalRemaining: number | string | null;
  overdueInstallments: number | string | null;
  installmentsTotal: number | string | null;
  paymentsTotal: number | string | null;
}

interface CountRawRow {
  total: number | string | null;
}
interface ContractCreateOptionsInstituteRow {
  instituteId: number | string;
  instituteName: string | null;
  activeContractId: number | string | null;
  activeContractStatus: string | null;
  activePlanId: number | string | null;
  activePlanName: string | null;
}

interface ContractCreateOptionsPlanRow {
  id: number | string;
  planName: string;
  minStudents: number | string;
  maxStudents: number | string;
  defaultPricePerStudent: number | string;
  defaultInstallmentsCount: number | string;
  administrativeFees: number | string | null;
}

interface InstallmentRawRow {
  id: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentPercentage: number | string;
  installmentAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  status: string;
  notes: string | null;
}

interface PaymentRawRow {
  id: number | string;
  installmentId: number | string | null;
  paymentDate: string;
  paidAmount: number | string;
  paymentMethod: string;
  receiptNo: string | null;
  receiptFile: string | null;
  status: string;
  notes: string | null;
  createdById: number | string | null;
  createdByName: string | null;
  createdAt: Date | string;
}

@Injectable()
export class InstituteAnnualContractsService {
  constructor(
    @InjectRepository(InstituteAnnualContract)
    private readonly contractRepo: Repository<InstituteAnnualContract>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Institute)
    private readonly instituteRepo: Repository<Institute>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,
    @InjectRepository(ContractPayment)
    private readonly paymentRepo: Repository<ContractPayment>,
  ) {}

  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  private toNumber(value: number | string | null | undefined): number {
    return Number(value ?? 0);
  }

  private toMoney(value: number | string | null | undefined): number {
    return this.round2(this.toNumber(value));
  }

  private makeContractNo(id: number, academicYear: number): string {
    return `CON-${academicYear}-${String(id).padStart(4, '0')}`;
  }

  private isInstituteAdminRole(role?: string): boolean {
    return ['INST_ADMIN', 'INSTITUTE_ADMIN'].includes(
      String(role || '')
        .trim()
        .toUpperCase(),
    );
  }

  private normalizeStatus(status?: string): ContractStatus | undefined {
    if (!status) return undefined;

    const normalized = status.trim().toUpperCase();

    if (!Object.values(ContractStatus).includes(normalized as ContractStatus)) {
      throw new BadRequestException(`Invalid contract status: ${status}`);
    }

    return normalized as ContractStatus;
  }

  calculateAmounts(input: CalculateContractDto) {
    const maxStudentsAllowed = Number(input.maxStudentsAllowed);
    const pricePerStudent = Number(input.pricePerStudent);
    const discountType = input.discountType ?? DiscountType.FIXED;
    const discountValue = Number(input.discountValue ?? 0);
    const administrativeFees = Number(input.administrativeFees ?? 0);
    const taxPercentage = Number(input.taxPercentage ?? 0);

    const packageAmount = this.round2(maxStudentsAllowed * pricePerStudent);

    const discountAmount =
      discountType === DiscountType.PERCENTAGE
        ? this.round2((packageAmount * discountValue) / 100)
        : this.round2(discountValue);

    if (discountAmount > packageAmount) {
      throw new BadRequestException(
        'discountAmount cannot exceed packageAmount',
      );
    }

    const amountAfterDiscount = this.round2(packageAmount - discountAmount);
    const taxBase = this.round2(amountAfterDiscount + administrativeFees);
    const taxAmount = this.round2((taxBase * taxPercentage) / 100);
    const totalAmount = this.round2(taxBase + taxAmount);

    return {
      maxStudentsAllowed,
      pricePerStudent,
      packageAmount,
      discountType,
      discountValue,
      discountAmount,
      amountAfterDiscount,
      administrativeFees,
      taxPercentage,
      taxBase,
      taxAmount,
      totalAmount,
    };
  }

  async create(dto: CreateInstituteAnnualContractDto, createdById?: number) {
    const institute = await this.instituteRepo
      .createQueryBuilder('institute')
      .where('institute.id = :id', { id: dto.instituteId })
      .andWhere('institute.deletedAt IS NULL')
      .getOne();

    if (!institute) throw new NotFoundException('Institute not found');

    const plan = await this.planRepo
      .createQueryBuilder('plan')
      .where('plan.id = :id', { id: dto.planId })
      .andWhere('plan.deleted_at IS NULL')
      .getOne();

    if (!plan) throw new NotFoundException('Subscription plan not found');

    if (plan.is_active !== 1) {
      throw new BadRequestException(
        'Cannot create contract using inactive plan',
      );
    }

    const createdBy = createdById
      ? await this.systemUserRepo
          .createQueryBuilder('systemUser')
          .where('systemUser.id = :id', { id: createdById })
          .getOne()
      : null;

    if (createdById && !createdBy) {
      throw new NotFoundException(
        `System user with id ${createdById} not found`,
      );
    }

    const maxStudentsAllowed = dto.maxStudentsAllowed ?? plan.max_students;
    const pricePerStudent =
      dto.pricePerStudent ?? Number(plan.default_price_per_student);
    const installmentsCount =
      dto.installmentsCount ?? plan.default_installments_count;
    const administrativeFees =
      dto.administrativeFees ?? Number(plan.administrative_fees ?? 0);

    if (
      maxStudentsAllowed < plan.min_students ||
      maxStudentsAllowed > plan.max_students
    ) {
      throw new BadRequestException(
        `maxStudentsAllowed must be between ${plan.min_students} and ${plan.max_students}`,
      );
    }

    const calculated = this.calculateAmounts({
      maxStudentsAllowed,
      pricePerStudent,
      discountType: dto.discountType ?? DiscountType.FIXED,
      discountValue: dto.discountValue ?? 0,
      administrativeFees,
      taxPercentage: dto.taxPercentage ?? 0,
    });

    const contract = this.contractRepo.create({
      institute,
      plan,
      academic_year: dto.academicYear,
      max_students_allowed: maxStudentsAllowed,
      price_per_student: pricePerStudent,
      package_amount: calculated.packageAmount,
      discount_type: calculated.discountType,
      discount_value: calculated.discountValue,
      discount_amount: calculated.discountAmount,
      amount_after_discount: calculated.amountAfterDiscount,
      administrative_fees: calculated.administrativeFees,
      tax_percentage: calculated.taxPercentage,
      tax_amount: calculated.taxAmount,
      total_amount: calculated.totalAmount,
      installments_count: installmentsCount,
      payment_percentage: 0,
      contract_start_date: dto.contractStartDate ?? null,
      contract_end_date: dto.contractEndDate ?? null,
      status: ContractStatus.DRAFT,
      notes: dto.notes?.trim() || null,
      createdBy,
    });

    const saved = await this.contractRepo.save(contract);
    return this.findOne(saved.id);
  }

  async findAll(filters: FindContractsFilters = {}) {
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const totalQb = this.contractRepo
      .createQueryBuilder('contract')
      .innerJoin('contract.institute', 'institute')
      .innerJoin('contract.plan', 'plan')
      .where('contract.deleted_at IS NULL');

    this.applyFilters(totalQb, filters);

    const total = await totalQb.getCount();

    const qb = this.createContractsListQuery(filters.languageId);
    this.applyFilters(qb, filters);

    const rows = await qb
      .orderBy('contract.id', 'DESC')
      .limit(limit)
      .offset(skip)
      .getRawMany<ContractListRawRow>();

    const items = rows.map((row, index) =>
      this.mapListRow(row, skip + index + 1),
    );

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number, languageId?: number) {
    const row = await this.createContractDetailsQuery(languageId)
      .andWhere('contract.id = :id', { id })
      .getRawOne<ContractDetailsRawRow>();

    if (!row) {
      throw new NotFoundException(`Annual contract with id ${id} not found`);
    }

    const installments = await this.getContractInstallments(id);
    const payments = await this.getContractPayments(id);

    return this.mapDetailsRow(row, installments, payments);
  }

  async update(id: number, dto: UpdateInstituteAnnualContractDto) {
    const contract = await this.contractRepo
      .createQueryBuilder('contract')
      .innerJoinAndSelect('contract.plan', 'plan')
      .innerJoinAndSelect('contract.institute', 'institute')
      .where('contract.id = :id', { id })
      .andWhere('contract.deleted_at IS NULL')
      .getOne();

    if (!contract) throw new NotFoundException('Annual contract not found');

    if (
      [ContractStatus.CLOSED, ContractStatus.CANCELLED].includes(
        contract.status,
      )
    ) {
      throw new BadRequestException(
        'Closed or cancelled contracts cannot be updated',
      );
    }

    if (dto.planId !== undefined && dto.planId !== contract.plan.id) {
      const plan = await this.planRepo
        .createQueryBuilder('plan')
        .where('plan.id = :id', { id: dto.planId })
        .andWhere('plan.deleted_at IS NULL')
        .getOne();

      if (!plan) throw new NotFoundException('Subscription plan not found');
      if (plan.is_active !== 1) {
        throw new BadRequestException(
          'Cannot update contract using inactive plan',
        );
      }

      contract.plan = plan;
    }

    const plan = contract.plan;

    if (dto.academicYear !== undefined)
      contract.academic_year = dto.academicYear;
    if (dto.maxStudentsAllowed !== undefined)
      contract.max_students_allowed = dto.maxStudentsAllowed;
    if (dto.pricePerStudent !== undefined)
      contract.price_per_student = dto.pricePerStudent;
    if (dto.discountType !== undefined)
      contract.discount_type = dto.discountType;
    if (dto.discountValue !== undefined)
      contract.discount_value = dto.discountValue;
    if (dto.administrativeFees !== undefined)
      contract.administrative_fees = dto.administrativeFees;
    if (dto.taxPercentage !== undefined)
      contract.tax_percentage = dto.taxPercentage;
    if (dto.installmentsCount !== undefined)
      contract.installments_count = dto.installmentsCount;
    if (dto.contractStartDate !== undefined)
      contract.contract_start_date = dto.contractStartDate;
    if (dto.contractEndDate !== undefined)
      contract.contract_end_date = dto.contractEndDate;
    if (dto.notes !== undefined) contract.notes = dto.notes?.trim() || null;

    if (
      contract.max_students_allowed < plan.min_students ||
      contract.max_students_allowed > plan.max_students
    ) {
      throw new BadRequestException(
        `maxStudentsAllowed must be between ${plan.min_students} and ${plan.max_students}`,
      );
    }

    const calculated = this.calculateAmounts({
      maxStudentsAllowed: contract.max_students_allowed,
      pricePerStudent: Number(contract.price_per_student),
      discountType: contract.discount_type,
      discountValue: Number(contract.discount_value),
      administrativeFees: Number(contract.administrative_fees),
      taxPercentage: Number(contract.tax_percentage),
    });

    contract.package_amount = calculated.packageAmount;
    contract.discount_amount = calculated.discountAmount;
    contract.amount_after_discount = calculated.amountAfterDiscount;
    contract.tax_amount = calculated.taxAmount;
    contract.total_amount = calculated.totalAmount;

    await this.contractRepo.save(contract);
    await this.recalculatePaymentPercentage(id);

    return this.findOne(id);
  }

  async activate(id: number) {
    const contract = await this.contractRepo
      .createQueryBuilder('contract')
      .innerJoinAndSelect('contract.institute', 'institute')
      .where('contract.id = :id', { id })
      .andWhere('contract.deleted_at IS NULL')
      .getOne();

    if (!contract) throw new NotFoundException('Annual contract not found');

    if (contract.status === ContractStatus.ACTIVE) {
      throw new BadRequestException('Annual contract is already active');
    }

    if (
      [ContractStatus.CLOSED, ContractStatus.CANCELLED].includes(
        contract.status,
      )
    ) {
      throw new BadRequestException(
        'Closed or cancelled contracts cannot be activated',
      );
    }

    const activeContract = await this.contractRepo.findOne({
      where: {
        institute: { id: contract.institute.id },
        academic_year: contract.academic_year,
        status: ContractStatus.ACTIVE,
        id: Not(id),
      },
    });

    if (activeContract) {
      throw new BadRequestException(
        'This institute already has an active contract for this academic year',
      );
    }

    if (Number(contract.total_amount) <= 0) {
      throw new BadRequestException(
        'Contract total amount must be greater than 0',
      );
    }

    if (!contract.contract_start_date || !contract.contract_end_date) {
      throw new BadRequestException(
        'Contract start date and end date are required before activation',
      );
    }

    contract.status = ContractStatus.ACTIVE;
    await this.contractRepo.save(contract);

    return this.findOne(id);
  }

  async close(id: number) {
    const contract = await this.contractRepo
      .createQueryBuilder('contract')
      .where('contract.id = :id', { id })
      .andWhere('contract.deleted_at IS NULL')
      .getOne();

    if (!contract) throw new NotFoundException('Annual contract not found');

    if (contract.status === ContractStatus.CLOSED) {
      throw new BadRequestException('Annual contract is already closed');
    }

    if (contract.status === ContractStatus.CANCELLED) {
      throw new BadRequestException('Cancelled contracts cannot be closed');
    }

    contract.status = ContractStatus.CLOSED;
    await this.contractRepo.save(contract);

    return this.findOne(id);
  }

  async cancel(id: number) {
    const contract = await this.contractRepo
      .createQueryBuilder('contract')
      .where('contract.id = :id', { id })
      .andWhere('contract.deleted_at IS NULL')
      .getOne();

    if (!contract) throw new NotFoundException('Annual contract not found');

    if (contract.status === ContractStatus.CANCELLED) {
      throw new BadRequestException('Annual contract is already cancelled');
    }

    const paymentsCount = await this.paymentRepo
      .createQueryBuilder('payment')
      .where('payment.contract_id = :id', { id })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.CONFIRMED,
      })
      .getCount();

    if (paymentsCount > 0) {
      throw new BadRequestException(
        'Cannot cancel contract because it already has confirmed payments',
      );
    }

    contract.status = ContractStatus.CANCELLED;
    await this.contractRepo.save(contract);

    return this.findOne(id);
  }

  async getCurrentForInstitute(
    instituteId: number,
    academicYear?: number,
    languageId?: number,
  ) {
    const year = academicYear ?? new Date().getFullYear();

    const row = await this.contractRepo
      .createQueryBuilder('contract')
      .select('contract.id', 'id')
      .innerJoin('contract.institute', 'institute')
      .where('institute.id = :instituteId', { instituteId })
      .andWhere('contract.academic_year = :year', { year })
      .andWhere('contract.status = :status', { status: ContractStatus.ACTIVE })
      .andWhere('contract.deleted_at IS NULL')
      .orderBy('contract.id', 'DESC')
      .getRawOne<{ id: number | string }>();

    if (!row) {
      throw new NotFoundException(
        `No active annual contract found for institute ${instituteId} in ${year}`,
      );
    }

    return this.findOne(Number(row.id), languageId);
  }

  async recalculatePaymentPercentage(contractId: number) {
    const row = await this.contractRepo
      .createQueryBuilder('contract')
      .select('contract.id', 'id')
      .addSelect('contract.total_amount', 'totalAmount')
      .addSelect(
        `(
          SELECT COALESCE(SUM(payment.paid_amount), 0)
          FROM contract_payments payment
          WHERE payment.contract_id = contract.id
          AND payment.status = 'CONFIRMED'
        )`,
        'totalPaid',
      )
      .where('contract.id = :contractId', { contractId })
      .getRawOne<{
        id: number | string;
        totalAmount: number | string;
        totalPaid: number | string;
      }>();

    if (!row) return;

    const totalAmount = this.toNumber(row.totalAmount);
    const totalPaid = this.toNumber(row.totalPaid);
    const paymentPercentage =
      totalAmount > 0 ? this.round2((totalPaid / totalAmount) * 100) : 0;

    await this.contractRepo.update(contractId, {
      payment_percentage: Math.min(paymentPercentage, 100),
    });
  }

  private createContractsListQuery(languageId?: number) {
    const instituteNameSelect = languageId
      ? `COALESCE(
          MAX(CASE WHEN language.id = :languageId THEN translation.name END),
          MIN(translation.name),
          CONCAT('Institute #', institute.id)
        )`
      : `COALESCE(MIN(translation.name), CONCAT('Institute #', institute.id))`;

    const qb = this.contractRepo
      .createQueryBuilder('contract')
      .innerJoin('contract.plan', 'plan')
      .innerJoin('contract.institute', 'institute')
      .leftJoin('institute.translations', 'translation')
      .leftJoin('translation.language', 'language')
      .where('contract.deleted_at IS NULL')
      .select('contract.id', 'id')
      .addSelect('institute.id', 'instituteId')
      .addSelect(instituteNameSelect, 'instituteName')
      .addSelect('plan.id', 'planId')
      .addSelect('plan.plan_name', 'planName')
      .addSelect('contract.academic_year', 'academicYear')
      .addSelect('contract.max_students_allowed', 'maxStudentsAllowed')
      .addSelect('contract.price_per_student', 'pricePerStudent')
      .addSelect('contract.package_amount', 'packageAmount')
      .addSelect('contract.total_amount', 'totalAmount')
      .addSelect('contract.payment_percentage', 'paymentPercentage')
      .addSelect('contract.installments_count', 'installmentsCount')
      .addSelect('contract.status', 'status')
      .addSelect('contract.created_at', 'createdAt')
      .addSelect('contract.updated_at', 'updatedAt')
      .addSelect(
        `(
          SELECT COALESCE(SUM(payment.paid_amount), 0)
          FROM contract_payments payment
          WHERE payment.contract_id = contract.id
          AND payment.status = 'CONFIRMED'
        )`,
        'paidAmount',
      )
      .groupBy('contract.id')
      .addGroupBy('institute.id')
      .addGroupBy('plan.id')
      .addGroupBy('plan.plan_name')
      .addGroupBy('contract.academic_year')
      .addGroupBy('contract.max_students_allowed')
      .addGroupBy('contract.price_per_student')
      .addGroupBy('contract.package_amount')
      .addGroupBy('contract.total_amount')
      .addGroupBy('contract.payment_percentage')
      .addGroupBy('contract.installments_count')
      .addGroupBy('contract.status')
      .addGroupBy('contract.created_at')
      .addGroupBy('contract.updated_at');

    if (languageId) {
      qb.setParameter('languageId', languageId);
    }

    return qb;
  }

  private createContractDetailsQuery(languageId?: number) {
    const instituteNameSelect = languageId
      ? `COALESCE(
          MAX(CASE WHEN language.id = :languageId THEN translation.name END),
          MIN(translation.name),
          CONCAT('Institute #', institute.id)
        )`
      : `COALESCE(MIN(translation.name), CONCAT('Institute #', institute.id))`;

    const qb = this.contractRepo
      .createQueryBuilder('contract')
      .innerJoin('contract.plan', 'plan')
      .innerJoin('contract.institute', 'institute')
      .leftJoin('institute.translations', 'translation')
      .leftJoin('translation.language', 'language')
      .leftJoin('contract.createdBy', 'createdBy')
      .leftJoin('createdBy.SysUserrole', 'createdByRole')
      .where('contract.deleted_at IS NULL')
      .select('contract.id', 'id')
      .addSelect('institute.id', 'instituteId')
      .addSelect(instituteNameSelect, 'instituteName')
      .addSelect('plan.id', 'planId')
      .addSelect('plan.plan_name', 'planName')
      .addSelect('contract.academic_year', 'academicYear')
      .addSelect('contract.max_students_allowed', 'maxStudentsAllowed')
      .addSelect('contract.price_per_student', 'pricePerStudent')
      .addSelect('contract.package_amount', 'packageAmount')
      .addSelect('contract.discount_type', 'discountType')
      .addSelect('contract.discount_value', 'discountValue')
      .addSelect('contract.discount_amount', 'discountAmount')
      .addSelect('contract.amount_after_discount', 'amountAfterDiscount')
      .addSelect('contract.administrative_fees', 'administrativeFees')
      .addSelect('contract.tax_percentage', 'taxPercentage')
      .addSelect('contract.tax_amount', 'taxAmount')
      .addSelect('contract.total_amount', 'totalAmount')
      .addSelect('contract.payment_percentage', 'paymentPercentage')
      .addSelect('contract.installments_count', 'installmentsCount')
      .addSelect('contract.contract_start_date', 'contractStartDate')
      .addSelect('contract.contract_end_date', 'contractEndDate')
      .addSelect('contract.status', 'status')
      .addSelect('contract.notes', 'notes')
      .addSelect('contract.created_at', 'createdAt')
      .addSelect('contract.updated_at', 'updatedAt')
      .addSelect('createdBy.id', 'createdById')
      .addSelect('createdBy.full_name', 'createdByName')
      .addSelect('createdByRole.role_title', 'createdByRole')
      .addSelect(
        `(
          SELECT COUNT(DISTINCT student.id)
          FROM \`user\` student
          WHERE student.annual_contract_id = contract.id
          AND student.deletedAt IS NULL
          AND student.is_active = 1
        )`,
        'addedStudents',
      )
      .addSelect(
        `(
          SELECT COALESCE(SUM(payment.paid_amount), 0)
          FROM contract_payments payment
          WHERE payment.contract_id = contract.id
          AND payment.status = 'CONFIRMED'
        )`,
        'paidAmount',
      )
      .addSelect(
        `(
          SELECT COUNT(installment.id)
          FROM contract_installments installment
          WHERE installment.contract_id = contract.id
        )`,
        'installmentsTotal',
      )
      .addSelect(
        `(
          SELECT COUNT(payment2.id)
          FROM contract_payments payment2
          WHERE payment2.contract_id = contract.id
        )`,
        'paymentsTotal',
      )
      .addSelect(
        `(
          SELECT COUNT(overdue.id)
          FROM contract_installments overdue
          WHERE overdue.contract_id = contract.id
          AND overdue.status IN ('PENDING', 'PARTIAL')
          AND overdue.due_date < CURDATE()
        )`,
        'overdueInstallments',
      )
      .groupBy('contract.id')
      .addGroupBy('institute.id')
      .addGroupBy('plan.id')
      .addGroupBy('plan.plan_name')
      .addGroupBy('contract.academic_year')
      .addGroupBy('contract.max_students_allowed')
      .addGroupBy('contract.price_per_student')
      .addGroupBy('contract.package_amount')
      .addGroupBy('contract.discount_type')
      .addGroupBy('contract.discount_value')
      .addGroupBy('contract.discount_amount')
      .addGroupBy('contract.amount_after_discount')
      .addGroupBy('contract.administrative_fees')
      .addGroupBy('contract.tax_percentage')
      .addGroupBy('contract.tax_amount')
      .addGroupBy('contract.total_amount')
      .addGroupBy('contract.payment_percentage')
      .addGroupBy('contract.installments_count')
      .addGroupBy('contract.contract_start_date')
      .addGroupBy('contract.contract_end_date')
      .addGroupBy('contract.status')
      .addGroupBy('contract.notes')
      .addGroupBy('contract.created_at')
      .addGroupBy('contract.updated_at')
      .addGroupBy('createdBy.id')
      .addGroupBy('createdBy.full_name')
      .addGroupBy('createdByRole.role_title');

    if (languageId) {
      qb.setParameter('languageId', languageId);
    }

    return qb;
  }

  private applyFilters(
    qb: SelectQueryBuilder<InstituteAnnualContract>,
    filters: FindContractsFilters,
  ) {
    const scopedInstituteId = this.isInstituteAdminRole(filters.requesterRole)
      ? filters.requesterInstituteId
      : filters.selectedInstituteId;

    if (scopedInstituteId && Number(scopedInstituteId) > 0) {
      qb.andWhere('institute.id = :instituteId', {
        instituteId: Number(scopedInstituteId),
      });
    }

    if (filters.academicYear) {
      qb.andWhere('contract.academic_year = :academicYear', {
        academicYear: Number(filters.academicYear),
      });
    }

    if (filters.planId) {
      qb.andWhere('plan.id = :planId', { planId: Number(filters.planId) });
    }

    const status = this.normalizeStatus(filters.status);
    if (status) {
      qb.andWhere('contract.status = :status', { status });
    }

    const search = filters.search?.trim();
    if (search) {
      qb.andWhere(
        `(
          LOWER(plan.plan_name) LIKE :search OR
          CAST(contract.academic_year AS CHAR) LIKE :search OR
          EXISTS (
            SELECT 1
            FROM institute_translation search_translation
            WHERE search_translation.instituteId = institute.id
            AND LOWER(search_translation.name) LIKE :search
          )
        )`,
        { search: `%${search.toLowerCase()}%` },
      );
    }
  }

  private mapListRow(row: ContractListRawRow, rowNumber?: number) {
    const id = Number(row.id);
    const academicYear = Number(row.academicYear);
    const totalAmount = this.toMoney(row.totalAmount);
    const paidAmount = this.toMoney(row.paidAmount);

    return {
      rowNumber,
      id,
      contractNo: this.makeContractNo(id, academicYear),
      institute: {
        id: row.instituteId ? Number(row.instituteId) : null,
        name: row.instituteName,
      },
      instituteId: row.instituteId ? Number(row.instituteId) : null,
      instituteName: row.instituteName,
      year: academicYear,
      academicYear,
      plan: {
        id: row.planId ? Number(row.planId) : null,
        name: row.planName,
      },
      planId: row.planId ? Number(row.planId) : null,
      planName: row.planName,
      maxStudents: Number(row.maxStudentsAllowed),
      maxStudentsAllowed: Number(row.maxStudentsAllowed),
      pricePerStudent: this.toMoney(row.pricePerStudent),
      packageAmount: this.toMoney(row.packageAmount),
      totalAmount,
      paidAmount,
      totalRemaining: this.round2(Math.max(totalAmount - paidAmount, 0)),
      paymentPercentage: this.toNumber(row.paymentPercentage),
      installmentsCount: Number(row.installmentsCount),
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapDetailsRow(
    row: ContractDetailsRawRow,
    installments: ReturnType<typeof this.mapInstallmentRow>[],
    payments: ReturnType<typeof this.mapPaymentRow>[],
  ) {
    const base = this.mapListRow(row);
    const maxStudentsAllowed = Number(row.maxStudentsAllowed);
    const addedStudents = Number(row.addedStudents ?? 0);
    const remainingStudents = Math.max(maxStudentsAllowed - addedStudents, 0);
    const totalAmount = this.toMoney(row.totalAmount);
    const totalPaid = this.toMoney(row.paidAmount);
    const totalRemaining = this.round2(Math.max(totalAmount - totalPaid, 0));

    return {
      ...base,

      header: {
        contractNo: base.contractNo,
        institute: base.institute,
        status: row.status,
        academicYear: base.academicYear,
        plan: base.plan,
        maxStudents: maxStudentsAllowed,
      },

      tabs: {
        contractInfo: true,
        installments: Number(row.installmentsTotal ?? installments.length),
        payments: Number(row.paymentsTotal ?? payments.length),
        students: addedStudents,
        documents: 0,
      },

      contractInfo: {
        pricePerStudent: this.toMoney(row.pricePerStudent),
        packageAmount: this.toMoney(row.packageAmount),
        discountType: row.discountType,
        discountValue: this.toNumber(row.discountValue),
        discountAmount: this.toMoney(row.discountAmount),
        amountAfterDiscount: this.toMoney(row.amountAfterDiscount),
        administrativeFees: this.toMoney(row.administrativeFees),
        taxPercentage: this.toNumber(row.taxPercentage),
        taxAmount: this.toMoney(row.taxAmount),
        totalAmount,
        installmentsCount: Number(row.installmentsCount),
        startDate: row.contractStartDate,
        endDate: row.contractEndDate,
        notes: row.notes,
        createdBy: row.createdById
          ? {
              id: Number(row.createdById),
              fullName: row.createdByName,
              role: row.createdByRole,
            }
          : null,
        createdAt: row.createdAt,
      },

      studentsUsage: {
        maxStudentsAllowed,
        addedStudents,
        remainingStudents,
      },

      settlement: {
        totalAmount,
        totalPaid,
        totalRemaining,
        paymentPercentage:
          totalAmount > 0 ? this.round2((totalPaid / totalAmount) * 100) : 0,
        overdueInstallments: Number(row.overdueInstallments ?? 0),
      },

      installments,
      payments,

      notes: row.notes,
      discountType: row.discountType,
      discountValue: this.toNumber(row.discountValue),
      discountAmount: this.toMoney(row.discountAmount),
      amountAfterDiscount: this.toMoney(row.amountAfterDiscount),
      administrativeFees: this.toMoney(row.administrativeFees),
      taxPercentage: this.toNumber(row.taxPercentage),
      taxAmount: this.toMoney(row.taxAmount),
      contractStartDate: row.contractStartDate,
      contractEndDate: row.contractEndDate,
      createdBy: row.createdById
        ? {
            id: Number(row.createdById),
            fullName: row.createdByName,
            role: row.createdByRole,
          }
        : null,
    };
  }

  private async getContractInstallments(contractId: number) {
    const rows = await this.installmentRepo
      .createQueryBuilder('installment')
      .where('installment.contract_id = :contractId', { contractId })
      .select('installment.id', 'id')
      .addSelect('installment.installment_no', 'installmentNo')
      .addSelect('installment.due_date', 'dueDate')
      .addSelect('installment.installment_percentage', 'installmentPercentage')
      .addSelect('installment.installment_amount', 'installmentAmount')
      .addSelect('installment.paid_amount', 'paidAmount')
      .addSelect('installment.remaining_amount', 'remainingAmount')
      .addSelect('installment.status', 'status')
      .addSelect('installment.notes', 'notes')
      .orderBy('installment.installment_no', 'ASC')
      .getRawMany<InstallmentRawRow>();

    return rows.map((row) => this.mapInstallmentRow(row));
  }

  private mapInstallmentRow(row: InstallmentRawRow) {
    return {
      id: Number(row.id),
      installmentNo: Number(row.installmentNo),
      dueDate: row.dueDate,
      installmentPercentage: this.toNumber(row.installmentPercentage),
      installmentAmount: this.toMoney(row.installmentAmount),
      paidAmount: this.toMoney(row.paidAmount),
      remainingAmount: this.toMoney(row.remainingAmount),
      status: row.status,
      notes: row.notes,
    };
  }

  private async getContractPayments(contractId: number) {
    const rows = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.installment', 'installment')
      .leftJoin('payment.createdBy', 'createdBy')
      .where('payment.contract_id = :contractId', { contractId })
      .select('payment.id', 'id')
      .addSelect('installment.id', 'installmentId')
      .addSelect('payment.payment_date', 'paymentDate')
      .addSelect('payment.paid_amount', 'paidAmount')
      .addSelect('payment.payment_method', 'paymentMethod')
      .addSelect('payment.receipt_no', 'receiptNo')
      .addSelect('payment.receipt_file', 'receiptFile')
      .addSelect('payment.status', 'status')
      .addSelect('payment.notes', 'notes')
      .addSelect('payment.created_at', 'createdAt')
      .addSelect('createdBy.id', 'createdById')
      .addSelect('createdBy.full_name', 'createdByName')
      .orderBy('payment.id', 'DESC')
      .getRawMany<PaymentRawRow>();

    return rows.map((row) => this.mapPaymentRow(row));
  }

  private mapPaymentRow(row: PaymentRawRow) {
    return {
      id: Number(row.id),
      installmentId: row.installmentId ? Number(row.installmentId) : null,
      paymentDate: row.paymentDate,
      paidAmount: this.toMoney(row.paidAmount),
      paymentMethod: row.paymentMethod,
      receiptNo: row.receiptNo,
      receiptFile: row.receiptFile,
      status: row.status,
      notes: row.notes,
      createdBy: row.createdById
        ? {
            id: Number(row.createdById),
            fullName: row.createdByName,
          }
        : null,
      createdAt: row.createdAt,
    };
  }
  async getCreateOptions(academicYear?: number, languageId?: number) {
    const year = Number(academicYear) || new Date().getFullYear();

    const instituteNameSelect = languageId
      ? `COALESCE(
        MAX(CASE WHEN language.id = :languageId THEN translation.name END),
        MIN(translation.name),
        CONCAT('Institute #', institute.id)
      )`
      : `COALESCE(
        MIN(translation.name),
        CONCAT('Institute #', institute.id)
      )`;

    const institutesRows = await this.instituteRepo
      .createQueryBuilder('institute')
      .leftJoin('institute.translations', 'translation')
      .leftJoin('translation.language', 'language')
      .leftJoin(
        'institute_annual_contracts',
        'activeContract',
        `
      activeContract.institute_id = institute.id
      AND activeContract.academic_year = :academicYear
      AND activeContract.status = :activeStatus
      AND activeContract.deleted_at IS NULL
      `,
        {
          academicYear: year,
          activeStatus: ContractStatus.ACTIVE,
        },
      )
      .leftJoin(
        'subscription_plans',
        'activePlan',
        'activePlan.id = activeContract.plan_id',
      )
      .where('institute.deletedAt IS NULL')
      .andWhere('institute.is_active = :isActive', { isActive: 1 })
      .select('institute.id', 'instituteId')
      .addSelect(instituteNameSelect, 'instituteName')
      .addSelect('activeContract.id', 'activeContractId')
      .addSelect('activeContract.status', 'activeContractStatus')
      .addSelect('activePlan.id', 'activePlanId')
      .addSelect('activePlan.plan_name', 'activePlanName')
      .groupBy('institute.id')
      .addGroupBy('activeContract.id')
      .addGroupBy('activeContract.status')
      .addGroupBy('activePlan.id')
      .addGroupBy('activePlan.plan_name')
      .orderBy('institute.id', 'DESC')
      .setParameters(languageId ? { languageId } : {})
      .getRawMany<ContractCreateOptionsInstituteRow>();

    const plansRows = await this.planRepo
      .createQueryBuilder('plan')
      .where('plan.deleted_at IS NULL')
      .andWhere('plan.is_active = :isActive', { isActive: 1 })
      .select('plan.id', 'id')
      .addSelect('plan.plan_name', 'planName')
      .addSelect('plan.min_students', 'minStudents')
      .addSelect('plan.max_students', 'maxStudents')
      .addSelect('plan.default_price_per_student', 'defaultPricePerStudent')
      .addSelect('plan.default_installments_count', 'defaultInstallmentsCount')
      .addSelect('plan.administrative_fees', 'administrativeFees')
      .orderBy('plan.id', 'DESC')
      .getRawMany<ContractCreateOptionsPlanRow>();

    const institutes = institutesRows.map((row) => {
      const hasActiveContract = row.activeContractId !== null;

      return {
        id: Number(row.instituteId),
        name: row.instituteName || `Institute #${row.instituteId}`,
        disabled: hasActiveContract,
        hasActiveContract,
        activeContract: hasActiveContract
          ? {
              id: Number(row.activeContractId),
              status: row.activeContractStatus,
              planId: row.activePlanId ? Number(row.activePlanId) : null,
              planName: row.activePlanName,
            }
          : null,
      };
    });

    const plans = plansRows.map((row) => ({
      id: Number(row.id),
      name: row.planName,
      minStudents: Number(row.minStudents),
      maxStudents: Number(row.maxStudents),
      defaultPricePerStudent: Number(row.defaultPricePerStudent),
      defaultInstallmentsCount: Number(row.defaultInstallmentsCount),
      administrativeFees: Number(row.administrativeFees ?? 0),
    }));

    const totalInstitutes = institutes.length;
    const institutesWithActiveContract = institutes.filter(
      (institute) => institute.hasActiveContract,
    ).length;

    return {
      academicYear: year,
      totals: {
        totalInstitutes,
        institutesWithActiveContract,
        availableInstitutes: totalInstitutes - institutesWithActiveContract,
        activePlans: plans.length,
      },
      institutes,
      plans,
    };
  }
}
