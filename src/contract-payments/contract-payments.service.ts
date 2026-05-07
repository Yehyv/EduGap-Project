import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractInstallmentsService } from 'src/contract-installments/contract-installments.service';
import { ContractInstallment } from 'src/contract-installments/entities/contract-installment.entity';
import {
  ContractStatus,
  InstituteAnnualContract,
} from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
import { CancelContractPaymentDto } from './dto/cancel-contract-payment.dto';
import { CreateContractPaymentDto } from './dto/create-contract-payment.dto';
import { UpdateContractPaymentDto } from './dto/update-contract-payment.dto';
import {
  ContractPayment,
  PaymentMethod,
  PaymentStatus,
} from './entities/contract-payment.entity';

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
  ) {}

  async create(dto: CreateContractPaymentDto, createdById?: number) {
    const contract = await this.contractRepo.findOne({
      where: { id: dto.contractId },
    });
    if (!contract) throw new NotFoundException('Annual contract not found');
    if (contract.status === ContractStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot record payment for cancelled contract',
      );
    }

    let installment: ContractInstallment | null = null;
    if (dto.installmentId) {
      installment = await this.installmentRepo.findOne({
        where: { id: dto.installmentId },
        relations: ['contract'],
      });
      if (!installment) throw new NotFoundException('Installment not found');
      if (installment.contract.id !== contract.id) {
        throw new BadRequestException(
          'Installment does not belong to this contract',
        );
      }
    }

    const createdBy = createdById
      ? await this.systemUserRepo.findOne({ where: { id: createdById } })
      : null;

    const payment = this.paymentRepo.create({
      contract,
      installment,
      payment_date: dto.paymentDate,
      paid_amount: dto.paidAmount,
      payment_method: dto.paymentMethod ?? PaymentMethod.BANK_TRANSFER,
      receipt_no: dto.receiptNo?.trim() || null,
      receipt_file: dto.receiptFile?.trim() || null,
      notes: dto.notes?.trim() || null,
      status: PaymentStatus.CONFIRMED,
      createdBy,
    });

    const saved = await this.paymentRepo.save(payment);

    if (installment)
      await this.installmentsService.recalculateInstallment(installment.id);
    await this.recalculateContractPaymentPercentage(contract.id);

    return this.findOne(saved.id);
  }

  async findByContract(contractId: number) {
    return this.paymentRepo.find({
      where: { contract: { id: contractId } },
      relations: ['installment', 'createdBy', 'cancelledBy'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['contract', 'installment', 'createdBy', 'cancelledBy'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async update(id: number, dto: UpdateContractPaymentDto) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['contract', 'installment'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed payments can be updated');
    }

    const oldInstallmentId = payment.installment?.id;

    if (dto.installmentId !== undefined) {
      if (dto.installmentId) {
        const installment = await this.installmentRepo.findOne({
          where: { id: dto.installmentId },
          relations: ['contract'],
        });
        if (!installment) throw new NotFoundException('Installment not found');
        if (installment.contract.id !== payment.contract.id) {
          throw new BadRequestException(
            'Installment does not belong to this contract',
          );
        }
        payment.installment = installment;
      } else {
        payment.installment = null;
      }
    }

    if (dto.paymentDate !== undefined) payment.payment_date = dto.paymentDate;
    if (dto.paidAmount !== undefined) payment.paid_amount = dto.paidAmount;
    if (dto.paymentMethod !== undefined)
      payment.payment_method = dto.paymentMethod;
    if (dto.receiptNo !== undefined)
      payment.receipt_no = dto.receiptNo?.trim() || null;
    if (dto.receiptFile !== undefined)
      payment.receipt_file = dto.receiptFile?.trim() || null;
    if (dto.notes !== undefined) payment.notes = dto.notes?.trim() || null;

    const saved = await this.paymentRepo.save(payment);

    if (oldInstallmentId)
      await this.installmentsService.recalculateInstallment(oldInstallmentId);
    if (saved.installment?.id)
      await this.installmentsService.recalculateInstallment(
        saved.installment.id,
      );
    await this.recalculateContractPaymentPercentage(payment.contract.id);

    return this.findOne(saved.id);
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

    if (payment.installment?.id)
      await this.installmentsService.recalculateInstallment(
        payment.installment.id,
      );
    await this.recalculateContractPaymentPercentage(payment.contract.id);

    return { message: 'Payment cancelled successfully', paymentId: id };
  }

  async recalculateContractPaymentPercentage(contractId: number) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
    });
    if (!contract) return;

    const result = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.paid_amount), 0)', 'totalPaid')
      .where('payment.contract_id = :contractId', { contractId })
      .andWhere('payment.status = :status', { status: PaymentStatus.CONFIRMED })
      .getRawOne<{ totalPaid: string }>();

    const totalPaid = Number(result?.totalPaid || 0);
    const totalAmount = Number(contract.total_amount || 0);
    const percentage =
      totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

    contract.payment_percentage = Number(percentage.toFixed(2));
    await this.contractRepo.save(contract);
  }
}
