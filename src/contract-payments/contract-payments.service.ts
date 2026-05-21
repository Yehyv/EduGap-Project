import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DataSource,
  Not,
  Repository,
  FindOptionsWhere,
  In,
} from 'typeorm';
import { ContractInstallmentsService } from 'src/contract-installments/contract-installments.service';
import { ContractInstallment } from 'src/contract-installments/entities/contract-installment.entity';
import {
  ContractStatus,
  InstituteAnnualContract,
} from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { CancelContractPaymentDto } from './dto/cancel-contract-payment.dto';
import { CreateContractPaymentDto } from './dto/create-contract-payment.dto';
import { FindContractPaymentsQueryDto } from './dto/find-contract-payments-query.dto';
import { ReverseContractPaymentDto } from './dto/reverse-contract-payment.dto';
import { UpdateContractPaymentDto } from './dto/update-contract-payment.dto';
import {
  ContractPayment,
  PaymentMethod,
  PaymentStatus,
} from './entities/contract-payment.entity';
import { UploadInstitutePaymentProofDto } from './dto/upload-institute-payment-proof.dto';

type AuthUser = {
  sub: number;
  email: string;
  instituteId: number;
  role?: string;
};

@Injectable()
export class ContractPaymentsService {
  constructor(
    @InjectRepository(ContractPayment)
    private readonly paymentRepo: Repository<ContractPayment>,

    @InjectRepository(InstituteAnnualContract)
    private readonly contractRepo: Repository<InstituteAnnualContract>,

    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,

    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,

    private readonly installmentsService: ContractInstallmentsService,

    private readonly dataSource: DataSource,
  ) {}

  private round2(value: number) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

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
        'You are not allowed to access payments for this institute',
      );
    }
  }

  private async getConfirmedPaidAmount(
    repo: Repository<ContractPayment>,
    contractId: number,
    excludePaymentId?: number,
  ) {
    const qb = repo
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.paid_amount), 0)', 'totalPaid')
      .where('payment.contract_id = :contractId', { contractId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.CONFIRMED,
      });

    if (excludePaymentId) {
      qb.andWhere('payment.id != :excludePaymentId', { excludePaymentId });
    }

    const result = await qb.getRawOne<{ totalPaid: string }>();
    return Number(result?.totalPaid || 0);
  }

  private async getConfirmedInstallmentPaidAmount(
    repo: Repository<ContractPayment>,
    installmentId: number,
    excludePaymentId?: number,
  ) {
    const qb = repo
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.paid_amount), 0)', 'totalPaid')
      .where('payment.installment_id = :installmentId', { installmentId })
      .andWhere('payment.status = :status', {
        status: PaymentStatus.CONFIRMED,
      });

    if (excludePaymentId) {
      qb.andWhere('payment.id != :excludePaymentId', { excludePaymentId });
    }

    const result = await qb.getRawOne<{ totalPaid: string }>();
    return Number(result?.totalPaid || 0);
  }

  private async validateDuplicateReceipt(
    repo: Repository<ContractPayment>,
    contractId: number,
    receiptNo?: string | null,
    excludePaymentId?: number,
  ) {
    const normalizedReceiptNo = receiptNo?.trim();

    if (!normalizedReceiptNo) return;

    const where: FindOptionsWhere<ContractPayment> = {
      contract: { id: contractId },
      receipt_no: normalizedReceiptNo,
      status: In([PaymentStatus.CONFIRMED, PaymentStatus.PENDING_REVIEW]),
    };

    if (excludePaymentId) {
      where.id = Not(excludePaymentId);
    }

    const existing = await repo.findOne({ where });

    if (existing) {
      throw new BadRequestException(
        'Duplicate receipt number for the same contract',
      );
    }
  }

  private async validatePaymentAmount(params: {
    paymentRepo: Repository<ContractPayment>;
    contract: InstituteAnnualContract;
    installment?: ContractInstallment | null;
    paidAmount: number;
    excludePaymentId?: number;
  }) {
    const { paymentRepo, contract, installment, paidAmount, excludePaymentId } =
      params;

    if (paidAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const totalPaid = await this.getConfirmedPaidAmount(
      paymentRepo,
      contract.id,
      excludePaymentId,
    );

    const contractRemaining = this.round2(
      Number(contract.total_amount) - totalPaid,
    );

    if (paidAmount > contractRemaining) {
      throw new BadRequestException(
        `Payment amount exceeds contract remaining amount. Remaining: ${contractRemaining}`,
      );
    }

    if (installment) {
      const installmentPaid = await this.getConfirmedInstallmentPaidAmount(
        paymentRepo,
        installment.id,
        excludePaymentId,
      );

      const installmentRemaining = this.round2(
        Number(installment.installment_amount) - installmentPaid,
      );

      if (paidAmount > installmentRemaining) {
        throw new BadRequestException(
          `Payment amount exceeds installment remaining amount. Remaining: ${installmentRemaining}`,
        );
      }
    }
  }

  async create(dto: CreateContractPaymentDto, createdById?: number) {
    const savedPaymentId = await this.dataSource.transaction(
      async (manager) => {
        const contractRepo = manager.getRepository(InstituteAnnualContract);
        const installmentRepo = manager.getRepository(ContractInstallment);
        const paymentRepo = manager.getRepository(ContractPayment);
        const systemUserRepo = manager.getRepository(SystemUser);

        const contract = await contractRepo.findOne({
          where: { id: dto.contractId },
          relations: ['institute'],
          lock: { mode: 'pessimistic_write' },
        });

        if (!contract) throw new NotFoundException('Annual contract not found');

        if (contract.status !== ContractStatus.ACTIVE) {
          throw new BadRequestException(
            'Payments can only be recorded for active contracts',
          );
        }

        let installment: ContractInstallment | null = null;

        if (dto.installmentId) {
          installment = await installmentRepo.findOne({
            where: { id: dto.installmentId },
            relations: ['contract'],
            lock: { mode: 'pessimistic_write' },
          });

          if (!installment)
            throw new NotFoundException('Installment not found');

          if (installment.contract.id !== contract.id) {
            throw new BadRequestException(
              'Installment does not belong to this contract',
            );
          }
        }

        await this.validateDuplicateReceipt(
          paymentRepo,
          contract.id,
          dto.receiptNo,
        );

        await this.validatePaymentAmount({
          paymentRepo,
          contract,
          installment,
          paidAmount: Number(dto.paidAmount),
        });

        const createdBy = createdById
          ? await systemUserRepo.findOne({ where: { id: createdById } })
          : null;

        const payment = paymentRepo.create({
          contract,
          installment,
          payment_date: dto.paymentDate,
          paid_amount: this.round2(Number(dto.paidAmount)),
          payment_method: dto.paymentMethod ?? PaymentMethod.BANK_TRANSFER,
          receipt_no: dto.receiptNo?.trim() || null,
          receipt_file: dto.receiptFile?.trim() || null,
          notes: dto.notes?.trim() || null,
          status: PaymentStatus.CONFIRMED,
          createdBy,
        });

        const saved = await paymentRepo.save(payment);
        return saved.id;
      },
    );

    const saved = await this.paymentRepo.findOne({
      where: { id: savedPaymentId },
      relations: ['contract', 'installment'],
    });

    if (saved?.installment?.id) {
      await this.installmentsService.recalculateInstallment(
        saved.installment.id,
      );
    }

    if (saved?.contract?.id) {
      await this.recalculateContractPaymentPercentage(saved.contract.id);
    }

    return this.findOne(savedPaymentId);
  }

  async findAll(query: FindContractPaymentsQueryDto, user?: AuthUser) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 10), 100);
    const skip = (page - 1) * limit;

    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.contract', 'contract')
      .leftJoinAndSelect('contract.institute', 'institute')
      .leftJoinAndSelect('payment.installment', 'installment')
      .leftJoinAndSelect('payment.createdBy', 'createdBy')
      .leftJoinAndSelect('payment.cancelledBy', 'cancelledBy')
      .orderBy('payment.id', 'DESC')
      .skip(skip)
      .take(limit);

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

    if (query.paymentMethod) {
      qb.andWhere('payment.payment_method = :paymentMethod', {
        paymentMethod: query.paymentMethod,
      });
    }

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.fromDate) {
      qb.andWhere('payment.payment_date >= :fromDate', {
        fromDate: query.fromDate,
      });
    }

    if (query.toDate) {
      qb.andWhere('payment.payment_date <= :toDate', {
        toDate: query.toDate,
      });
    }

    if (query.search?.trim()) {
      const search = `%${query.search.trim()}%`;

      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('payment.receipt_no LIKE :search', { search })
            .orWhere('payment.notes LIKE :search', { search })
            .orWhere('contract.contract_no LIKE :search', { search });
        }),
      );
    }

    const [items, total] = await qb.getManyAndCount();

    const totalPaid = items.reduce((sum, item) => {
      if (item.status !== PaymentStatus.CONFIRMED) return sum;
      return this.round2(sum + Number(item.paid_amount || 0));
    }, 0);

    return {
      data: items.map((payment) => this.mapPaymentResponse(payment)),
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        count: items.length,
      },
      summary: {
        totalPayments: total,
        currentPageConfirmedNetPaid: this.round2(totalPaid),
      },
    };
  }

  async findByContract(contractId: number, user?: AuthUser) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
      relations: ['institute'],
    });

    if (!contract) throw new NotFoundException('Annual contract not found');

    this.assertInstituteScope(contract, user);

    const payments = await this.paymentRepo.find({
      where: { contract: { id: contractId } },
      relations: ['contract', 'installment', 'createdBy', 'cancelledBy'],
      order: { id: 'DESC' },
    });

    return payments.map((payment) => this.mapPaymentResponse(payment));
  }

  async findOne(id: number, user?: AuthUser) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: [
        'contract',
        'contract.institute',
        'installment',
        'createdBy',
        'cancelledBy',
      ],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    this.assertInstituteScope(payment.contract, user);

    return this.mapPaymentResponse(payment);
  }

  async update(id: number, dto: UpdateContractPaymentDto) {
    const savedPaymentId = await this.dataSource.transaction(
      async (manager) => {
        const paymentRepo = manager.getRepository(ContractPayment);
        const installmentRepo = manager.getRepository(ContractInstallment);

        const payment = await paymentRepo.findOne({
          where: { id },
          relations: ['contract', 'installment'],
          lock: { mode: 'pessimistic_write' },
        });

        if (!payment) throw new NotFoundException('Payment not found');

        if (payment.status !== PaymentStatus.CONFIRMED) {
          throw new BadRequestException(
            'Only confirmed payments can be updated',
          );
        }

        if (payment.paid_amount < 0) {
          throw new BadRequestException('Reversal payments cannot be updated');
        }

        if (payment.contract.status !== ContractStatus.ACTIVE) {
          throw new BadRequestException(
            'Payments can only be updated for active contracts',
          );
        }

        const oldInstallmentId = payment.installment?.id;

        let nextInstallment = payment.installment;

        if (dto.installmentId !== undefined) {
          if (dto.installmentId) {
            const installment = await installmentRepo.findOne({
              where: { id: dto.installmentId },
              relations: ['contract'],
              lock: { mode: 'pessimistic_write' },
            });

            if (!installment)
              throw new NotFoundException('Installment not found');

            if (installment.contract.id !== payment.contract.id) {
              throw new BadRequestException(
                'Installment does not belong to this contract',
              );
            }

            nextInstallment = installment;
          } else {
            nextInstallment = null;
          }
        }

        const nextPaidAmount =
          dto.paidAmount !== undefined
            ? Number(dto.paidAmount)
            : Number(payment.paid_amount);

        await this.validateDuplicateReceipt(
          paymentRepo,
          payment.contract.id,
          dto.receiptNo ?? payment.receipt_no,
          payment.id,
        );

        await this.validatePaymentAmount({
          paymentRepo,
          contract: payment.contract,
          installment: nextInstallment,
          paidAmount: nextPaidAmount,
          excludePaymentId: payment.id,
        });

        payment.installment = nextInstallment;
        if (dto.paymentDate !== undefined)
          payment.payment_date = dto.paymentDate;
        if (dto.paidAmount !== undefined)
          payment.paid_amount = this.round2(Number(dto.paidAmount));
        if (dto.paymentMethod !== undefined)
          payment.payment_method = dto.paymentMethod;
        if (dto.receiptNo !== undefined)
          payment.receipt_no = dto.receiptNo?.trim() || null;
        if (dto.receiptFile !== undefined)
          payment.receipt_file = dto.receiptFile?.trim() || null;
        if (dto.notes !== undefined) payment.notes = dto.notes?.trim() || null;

        const saved = await paymentRepo.save(payment);

        return {
          paymentId: saved.id,
          oldInstallmentId,
          newInstallmentId: saved.installment?.id,
          contractId: saved.contract.id,
        };
      },
    );

    if (savedPaymentId.oldInstallmentId) {
      await this.installmentsService.recalculateInstallment(
        savedPaymentId.oldInstallmentId,
      );
    }

    if (savedPaymentId.newInstallmentId) {
      await this.installmentsService.recalculateInstallment(
        savedPaymentId.newInstallmentId,
      );
    }

    await this.recalculateContractPaymentPercentage(savedPaymentId.contractId);

    return this.findOne(savedPaymentId.paymentId);
  }

  async uploadReceipt(id: number, receiptFile: string, user?: AuthUser) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['contract', 'contract.institute'],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    this.assertInstituteScope(payment.contract, user);

    if (payment.status !== PaymentStatus.CONFIRMED) {
      throw new BadRequestException(
        'Receipt can only be uploaded for confirmed payments',
      );
    }

    payment.receipt_file = receiptFile;

    const saved = await this.paymentRepo.save(payment);

    return {
      message: 'Receipt uploaded successfully',
      payment: await this.findOne(saved.id, user),
    };
  }

  async cancel(
    id: number,
    dto: CancelContractPaymentDto,
    cancelledById?: number,
  ) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['contract', 'installment'],
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.paid_amount < 0) {
      throw new BadRequestException('Reversal payments cannot be cancelled');
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new BadRequestException('Payment is already cancelled');
    }

    const cancelledBy = cancelledById
      ? await this.systemUserRepo.findOne({ where: { id: cancelledById } })
      : null;

    payment.status = PaymentStatus.CANCELLED;
    payment.cancel_reason = dto.cancelReason.trim();
    payment.cancelledBy = cancelledBy;
    payment.cancelled_at = new Date();

    await this.paymentRepo.save(payment);

    if (payment.installment?.id) {
      await this.installmentsService.recalculateInstallment(
        payment.installment.id,
      );
    }

    await this.recalculateContractPaymentPercentage(payment.contract.id);

    return {
      message: 'Payment cancelled successfully',
      paymentId: id,
    };
  }

  async reverse(
    id: number,
    dto: ReverseContractPaymentDto,
    reversedById?: number,
  ) {
    const reversalId = await this.dataSource.transaction(async (manager) => {
      const paymentRepo = manager.getRepository(ContractPayment);
      const systemUserRepo = manager.getRepository(SystemUser);

      const originalPayment = await paymentRepo.findOne({
        where: { id },
        relations: ['contract', 'installment'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!originalPayment) throw new NotFoundException('Payment not found');

      if (originalPayment.status !== PaymentStatus.CONFIRMED) {
        throw new BadRequestException(
          'Only confirmed payments can be reversed',
        );
      }

      if (Number(originalPayment.paid_amount) <= 0) {
        throw new BadRequestException('This payment is already a reversal');
      }

      const existingReversal = await paymentRepo
        .createQueryBuilder('payment')
        .where('payment.contract_id = :contractId', {
          contractId: originalPayment.contract.id,
        })
        .andWhere('payment.receipt_no LIKE :receiptNo', {
          receiptNo: `REV-${originalPayment.id}-%`,
        })
        .getOne();

      if (existingReversal) {
        throw new BadRequestException('This payment is already reversed');
      }

      const reversedBy = reversedById
        ? await systemUserRepo.findOne({ where: { id: reversedById } })
        : null;

      const reversalPayment = paymentRepo.create({
        contract: originalPayment.contract,
        installment: originalPayment.installment,
        payment_date: dto.reversalDate ?? new Date().toISOString().slice(0, 10),
        paid_amount: this.round2(Number(originalPayment.paid_amount) * -1),
        payment_method: originalPayment.payment_method,
        receipt_no: `REV-${originalPayment.id}-${Date.now()}`,
        receipt_file: null,
        notes:
          `REVERSAL OF PAYMENT #${originalPayment.id}. Reason: ${dto.reason.trim()}` +
          (dto.notes?.trim() ? ` | Notes: ${dto.notes.trim()}` : ''),
        status: PaymentStatus.CONFIRMED,
        createdBy: reversedBy,
      });

      const saved = await paymentRepo.save(reversalPayment);
      return saved.id;
    });

    const reversalPayment = await this.paymentRepo.findOne({
      where: { id: reversalId },
      relations: ['contract', 'installment'],
    });

    if (reversalPayment?.installment?.id) {
      await this.installmentsService.recalculateInstallment(
        reversalPayment.installment.id,
      );
    }

    if (reversalPayment?.contract?.id) {
      await this.recalculateContractPaymentPercentage(
        reversalPayment.contract.id,
      );
    }

    return {
      message: 'Payment reversed successfully',
      originalPaymentId: id,
      reversalPayment: await this.findOne(reversalId),
    };
  }

  async recalculateContractPaymentPercentage(contractId: number) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
    });

    if (!contract) return;

    const totalPaid = await this.getConfirmedPaidAmount(
      this.paymentRepo,
      contractId,
    );

    const totalAmount = Number(contract.total_amount || 0);

    const percentage =
      totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

    contract.payment_percentage = Number(percentage.toFixed(2));

    await this.contractRepo.save(contract);
  }

  private mapPaymentResponse(payment: ContractPayment) {
    const amount = Number(payment.paid_amount || 0);

    return {
      id: payment.id,
      paymentId: payment.id,
      contractId: payment.contract?.id ?? null,
      contractNo:
        (payment.contract as { contract_no?: string })?.contract_no ?? null,
      instituteId:
        (payment.contract as { institute?: { id?: number } })?.institute?.id ??
        null,
      installment: payment.installment
        ? {
            id: payment.installment.id,
            installmentNo: payment.installment.installment_no,
            dueDate: payment.installment.due_date,
            installmentAmount: Number(payment.installment.installment_amount),
            paidAmount: Number(payment.installment.paid_amount),
            remainingAmount: Number(payment.installment.remaining_amount),
            status: payment.installment.status,
          }
        : null,
      paymentDate: payment.payment_date,
      amount,
      paidAmount: amount,
      paymentMethod: payment.payment_method,
      receiptNo: payment.receipt_no,
      receiptFile: payment.receipt_file,
      notes: payment.notes,
      status: payment.status,
      isReversal: amount < 0,
      cancelReason: payment.cancel_reason,
      cancelledAt: payment.cancelled_at,
      createdBy: payment.createdBy
        ? {
            id: payment.createdBy.id,
            fullName: payment.createdBy.full_name,
          }
        : null,
      cancelledBy: payment.cancelledBy
        ? {
            id: payment.cancelledBy.id,
            fullName: payment.cancelledBy.full_name,
          }
        : null,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    };
  }
  async uploadInstitutePaymentProof(
    dto: UploadInstitutePaymentProofDto,
    receiptFile: string,
    user: AuthUser,
  ) {
    if (!user?.instituteId) {
      throw new ForbiddenException('Institute user is required');
    }

    if (!this.isInstituteRole(user)) {
      throw new ForbiddenException(
        'Only institute admins can upload payment proof',
      );
    }

    const savedPaymentId = await this.dataSource.transaction(
      async (manager) => {
        const installmentRepo = manager.getRepository(ContractInstallment);
        const paymentRepo = manager.getRepository(ContractPayment);
        const systemUserRepo = manager.getRepository(SystemUser);

        const installment = await installmentRepo.findOne({
          where: { id: dto.installmentId },
          relations: ['contract', 'contract.institute'],
          lock: { mode: 'pessimistic_write' },
        });

        if (!installment) {
          throw new NotFoundException('Installment not found');
        }

        const contract = installment.contract;

        if (!contract) {
          throw new NotFoundException('Annual contract not found');
        }

        this.assertInstituteScope(contract, user);

        if (contract.status !== ContractStatus.ACTIVE) {
          throw new BadRequestException(
            'Payment proof can only be uploaded for active contracts',
          );
        }

        const amount = this.round2(Number(dto.amount || 0));

        if (amount <= 0) {
          throw new BadRequestException(
            'Payment amount must be greater than zero',
          );
        }

        const submittedForInstallment = await paymentRepo
          .createQueryBuilder('payment')
          .select('COALESCE(SUM(payment.paid_amount), 0)', 'totalPaid')
          .where('payment.installment_id = :installmentId', {
            installmentId: installment.id,
          })
          .andWhere('payment.status IN (:...statuses)', {
            statuses: [PaymentStatus.CONFIRMED, PaymentStatus.PENDING_REVIEW],
          })
          .getRawOne<{ totalPaid: string }>();

        const installmentSubmitted = Number(
          submittedForInstallment?.totalPaid || 0,
        );

        const installmentRemaining = this.round2(
          Number(installment.installment_amount || 0) - installmentSubmitted,
        );

        if (amount > installmentRemaining) {
          throw new BadRequestException(
            `Payment proof amount exceeds installment remaining amount. Remaining: ${installmentRemaining}`,
          );
        }

        const submittedForContract = await paymentRepo
          .createQueryBuilder('payment')
          .select('COALESCE(SUM(payment.paid_amount), 0)', 'totalPaid')
          .where('payment.contract_id = :contractId', {
            contractId: contract.id,
          })
          .andWhere('payment.status IN (:...statuses)', {
            statuses: [PaymentStatus.CONFIRMED, PaymentStatus.PENDING_REVIEW],
          })
          .getRawOne<{ totalPaid: string }>();

        const contractSubmitted = Number(submittedForContract?.totalPaid || 0);

        const contractRemaining = this.round2(
          Number(contract.total_amount || 0) - contractSubmitted,
        );

        if (amount > contractRemaining) {
          throw new BadRequestException(
            `Payment proof amount exceeds contract remaining amount. Remaining: ${contractRemaining}`,
          );
        }

        const createdBy = user.sub
          ? await systemUserRepo.findOne({ where: { id: user.sub } })
          : null;

        const payment = paymentRepo.create({
          contract,
          installment,
          payment_date: new Date().toISOString().slice(0, 10),
          paid_amount: amount,
          payment_method: dto.paymentMethod ?? PaymentMethod.BANK_TRANSFER,
          receipt_no: dto.receiptNo?.trim() || null,
          receipt_file: receiptFile,
          notes: dto.notes?.trim() || null,
          status: PaymentStatus.PENDING_REVIEW,
          createdBy,
        });

        const saved = await paymentRepo.save(payment);

        return saved.id;
      },
    );

    const saved = await this.paymentRepo.findOne({
      where: { id: savedPaymentId },
      relations: ['contract', 'contract.institute', 'installment', 'createdBy'],
    });

    if (!saved) {
      throw new NotFoundException('Payment proof was not saved');
    }

    return {
      message: 'Payment proof uploaded successfully and is pending review',
      payment: {
        paymentId: saved.id,
        contractId: saved.contract.id,
        installmentId: saved.installment?.id ?? null,
        amount: this.round2(Number(saved.paid_amount || 0)),
        paymentMethod: saved.payment_method,
        receiptNo: saved.receipt_no,
        receiptFile: saved.receipt_file,
        status: saved.status,
        notes: saved.notes,
        createdAt: saved.created_at,
      },
    };
  }
}
