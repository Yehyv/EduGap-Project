import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Institute } from 'src/institutes/entities/institute.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { SubscriptionPlan } from 'src/subscription-plans/entities/subscription-plan.entity';
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
  status?: string;
  languageId?: number;
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
    private readonly dataSource: DataSource,
  ) {}

  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  private isInstituteAdminRole(role?: string): boolean {
    return ['INST_ADMIN', 'INSTITUTE_ADMIN'].includes(
      String(role || '')
        .trim()
        .toUpperCase(),
    );
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
      packageAmount,
      discountAmount,
      amountAfterDiscount,
      taxBase,
      taxAmount,
      totalAmount,
    };
  }

  async create(dto: CreateInstituteAnnualContractDto, createdById?: number) {
    const institute = await this.instituteRepo.findOne({
      where: { id: dto.instituteId },
    });
    if (!institute) throw new NotFoundException('Institute not found');

    const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    if (plan.is_active !== 1) {
      throw new BadRequestException(
        'Cannot create contract using inactive plan',
      );
    }

    const createdBy = createdById
      ? await this.systemUserRepo.findOne({ where: { id: createdById } })
      : null;

    const maxStudentsAllowed = dto.maxStudentsAllowed ?? plan.max_students;
    const pricePerStudent =
      dto.pricePerStudent ?? Number(plan.default_price_per_student);
    const installmentsCount =
      dto.installmentsCount ?? plan.default_installments_count;

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
      administrativeFees: dto.administrativeFees ?? 0,
      taxPercentage: dto.taxPercentage ?? 0,
    });

    const contract = this.contractRepo.create({
      institute,
      plan,
      academic_year: dto.academicYear,
      max_students_allowed: maxStudentsAllowed,
      price_per_student: pricePerStudent,
      package_amount: calculated.packageAmount,
      discount_type: dto.discountType ?? DiscountType.FIXED,
      discount_value: dto.discountValue ?? 0,
      discount_amount: calculated.discountAmount,
      amount_after_discount: calculated.amountAfterDiscount,
      administrative_fees: dto.administrativeFees ?? 0,
      tax_percentage: dto.taxPercentage ?? 0,
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
    const qb = this.contractRepo
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.plan', 'plan')
      .leftJoinAndSelect('contract.institute', 'institute')
      .leftJoinAndSelect('institute.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('contract.deleted_at IS NULL');

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
        academicYear: filters.academicYear,
      });
    }

    if (filters.status) {
      qb.andWhere('contract.status = :status', {
        status: filters.status.trim().toUpperCase(),
      });
    }

    const contracts = await qb.orderBy('contract.id', 'DESC').getMany();

    return contracts.map((contract) =>
      this.toContractListItem(contract, filters.languageId),
    );
  }

  async findOne(id: number, languageId?: number) {
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: [
        'plan',
        'institute',
        'institute.translations',
        'institute.translations.language',
        'installments',
        'payments',
      ],
    });

    if (!contract) {
      throw new NotFoundException(`Annual contract with id ${id} not found`);
    }

    const settlement = await this.getContractNumbers(id);

    return {
      ...this.toContractListItem(contract, languageId),
      notes: contract.notes,
      discountType: contract.discount_type,
      discountValue: Number(contract.discount_value),
      discountAmount: Number(contract.discount_amount),
      amountAfterDiscount: Number(contract.amount_after_discount),
      administrativeFees: Number(contract.administrative_fees),
      taxPercentage: Number(contract.tax_percentage),
      taxAmount: Number(contract.tax_amount),
      contractStartDate: contract.contract_start_date,
      contractEndDate: contract.contract_end_date,
      installments: contract.installments?.sort(
        (a, b) => a.installment_no - b.installment_no,
      ),
      settlement,
    };
  }

  async update(id: number, dto: UpdateInstituteAnnualContractDto) {
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: ['plan', 'institute'],
    });
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
      const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
      if (!plan) throw new NotFoundException('Subscription plan not found');
      contract.plan = plan;
    }

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
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: ['institute'],
    });
    if (!contract) throw new NotFoundException('Annual contract not found');

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

    contract.status = ContractStatus.ACTIVE;
    await this.contractRepo.save(contract);

    return this.findOne(id);
  }

  async close(id: number) {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Annual contract not found');

    contract.status = ContractStatus.CLOSED;
    await this.contractRepo.save(contract);

    return this.findOne(id);
  }

  async cancel(id: number) {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Annual contract not found');

    contract.status = ContractStatus.CANCELLED;
    await this.contractRepo.save(contract);

    return this.findOne(id);
  }

  async getCurrentForInstitute(instituteId: number, academicYear?: number) {
    const year = academicYear ?? new Date().getFullYear();

    const contract = await this.contractRepo.findOne({
      where: {
        institute: { id: instituteId },
        academic_year: year,
        status: ContractStatus.ACTIVE,
      },
      relations: ['plan', 'institute', 'installments'],
      order: { id: 'DESC' },
    });

    if (!contract) {
      throw new NotFoundException(
        `No active annual contract found for institute ${instituteId} in ${year}`,
      );
    }

    return this.findOne(contract.id);
  }

  async recalculatePaymentPercentage(contractId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
        c.id,
        c.total_amount AS totalAmount,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid
      FROM institute_annual_contracts c
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
      `,
      [contractId],
    );

    const row = rows[0];
    if (!row) return;

    const totalAmount = Number(row.totalAmount || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const paymentPercentage =
      totalAmount > 0 ? this.round2((totalPaid / totalAmount) * 100) : 0;

    await this.contractRepo.update(contractId, {
      payment_percentage: Math.min(paymentPercentage, 100),
    });
  }

  private async getContractNumbers(contractId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT
        c.max_students_allowed AS maxStudentsAllowed,
        c.total_amount AS totalAmount,
        c.payment_percentage AS paymentPercentage,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid,
        SUM(CASE WHEN ci.status IN ('PENDING', 'PARTIAL') AND ci.due_date < CURDATE() THEN 1 ELSE 0 END) AS overdueInstallments
      FROM institute_annual_contracts c
      LEFT JOIN \`user\` u ON u.annual_contract_id = c.id AND u.deletedAt IS NULL AND u.is_active = 1
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      LEFT JOIN contract_installments ci ON ci.contract_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
      `,
      [contractId],
    );

    const row = rows[0] || {};
    const totalAmount = Number(row.totalAmount || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const addedStudents = Number(row.addedStudents || 0);
    const maxStudentsAllowed = Number(row.maxStudentsAllowed || 0);

    return {
      addedStudents,
      remainingStudents: Math.max(maxStudentsAllowed - addedStudents, 0),
      totalPaid: this.round2(totalPaid),
      totalRemaining: this.round2(Math.max(totalAmount - totalPaid, 0)),
      paymentPercentage: Number(row.paymentPercentage || 0),
      overdueInstallments: Number(row.overdueInstallments || 0),
    };
  }

  private toContractListItem(
    contract: InstituteAnnualContract,
    languageId?: number,
  ) {
    const selectedTranslation =
      contract.institute?.translations?.find(
        (tr) => tr.language?.id === languageId,
      ) || contract.institute?.translations?.[0];

    return {
      id: contract.id,
      instituteId: contract.institute?.id,
      instituteName:
        selectedTranslation?.name ||
        (contract.institute?.id ? `Institute #${contract.institute.id}` : null),
      planId: contract.plan?.id,
      planName: contract.plan?.plan_name,
      academicYear: contract.academic_year,
      maxStudentsAllowed: contract.max_students_allowed,
      pricePerStudent: Number(contract.price_per_student),
      packageAmount: Number(contract.package_amount),
      totalAmount: Number(contract.total_amount),
      installmentsCount: contract.installments_count,
      paymentPercentage: Number(contract.payment_percentage),
      status: contract.status,
      createdAt: contract.created_at,
      updatedAt: contract.updated_at,
    };
  }
}
