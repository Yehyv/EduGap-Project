import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ContractStatus,
  InstituteAnnualContract,
} from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';
import { GenerateInstallmentsDto } from './dto/generate-installments.dto';
import { UpdateContractInstallmentDto } from './dto/update-contract-installment.dto';
import {
  ContractInstallment,
  InstallmentStatus,
} from './entities/contract-installment.entity';

@Injectable()
export class ContractInstallmentsService {
  constructor(
    @InjectRepository(ContractInstallment)
    private readonly installmentRepo: Repository<ContractInstallment>,
    @InjectRepository(InstituteAnnualContract)
    private readonly contractRepo: Repository<InstituteAnnualContract>,
    private readonly dataSource: DataSource,
  ) {}

  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  async generate(contractId: number, dto: GenerateInstallmentsDto) {
    const contract = await this.contractRepo.findOne({
      where: { id: contractId },
      relations: ['installments'],
    });

    if (!contract) throw new NotFoundException('Annual contract not found');

    if (contract.status === ContractStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot generate installments for cancelled contract',
      );
    }

    const existing = await this.installmentRepo.count({
      where: { contract: { id: contractId } },
    });
    if (existing > 0 && !dto.force) {
      throw new BadRequestException(
        'Installments already exist. Pass force=true to regenerate.',
      );
    }
    if (existing > 0 && dto.force) {
      await this.installmentRepo.delete({
        contract: { id: contractId },
      } as any);
    }

    const count = contract.installments_count || 1;
    const total = Number(contract.total_amount);
    const baseAmount = this.round2(total / count);
    const percentage = this.round2(100 / count);
    const firstDueDate = dto.firstDueDate
      ? new Date(dto.firstDueDate)
      : contract.contract_start_date
        ? new Date(contract.contract_start_date)
        : new Date();
    const intervalMonths = dto.intervalMonths ?? 1;

    const installments: ContractInstallment[] = [];
    let accumulated = 0;

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date(firstDueDate);
      dueDate.setMonth(firstDueDate.getMonth() + (i - 1) * intervalMonths);
      const amount =
        i === count ? this.round2(total - accumulated) : baseAmount;
      accumulated = this.round2(accumulated + amount);

      installments.push(
        this.installmentRepo.create({
          contract,
          installment_no: i,
          due_date: dueDate.toISOString().slice(0, 10),
          installment_percentage:
            i === count
              ? this.round2(100 - percentage * (count - 1))
              : percentage,
          installment_amount: amount,
          paid_amount: 0,
          remaining_amount: amount,
          status: InstallmentStatus.PENDING,
          notes: null,
        }),
      );
    }

    const saved = await this.installmentRepo.save(installments);
    return {
      message: 'Installments generated successfully',
      contractId,
      installments: saved,
    };
  }

  async findByContract(contractId: number) {
    return this.installmentRepo.find({
      where: { contract: { id: contractId } },
      order: { installment_no: 'ASC' },
      relations: ['payments'],
    });
  }

  async update(id: number, dto: UpdateContractInstallmentDto) {
    const installment = await this.installmentRepo.findOne({
      where: { id },
      relations: ['contract'],
    });
    if (!installment) throw new NotFoundException('Installment not found');

    if (dto.dueDate !== undefined) installment.due_date = dto.dueDate;
    if (dto.installmentAmount !== undefined) {
      installment.installment_amount = dto.installmentAmount;
      const remaining =
        Number(dto.installmentAmount) - Number(installment.paid_amount || 0);
      installment.remaining_amount = this.round2(Math.max(remaining, 0));
      if (Number(installment.remaining_amount) === 0)
        installment.status = InstallmentStatus.PAID;
      else if (Number(installment.paid_amount || 0) > 0)
        installment.status = InstallmentStatus.PARTIAL;
    }
    if (dto.installmentPercentage !== undefined)
      installment.installment_percentage = dto.installmentPercentage;
    if (dto.status !== undefined) installment.status = dto.status;
    if (dto.notes !== undefined) installment.notes = dto.notes?.trim() || null;

    return this.installmentRepo.save(installment);
  }

  async upcoming(days = 15) {
    const safeDays = Math.min(Math.max(Number(days) || 15, 1), 365);
    return this.dataSource.query(
      `
      SELECT ci.id AS installmentId, ci.installment_no AS installmentNo, ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount, ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount, ci.status,
        c.id AS contractId, c.academic_year AS academicYear,
        i.id AS instituteId, DATEDIFF(ci.due_date, CURDATE()) AS daysRemaining
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      WHERE ci.status IN ('PENDING', 'PARTIAL')
        AND ci.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY ci.due_date ASC
      `,
      [safeDays],
    );
  }

  async overdue() {
    return this.dataSource.query(
      `
      SELECT ci.id AS installmentId, ci.installment_no AS installmentNo, ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount, ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount, ci.status,
        c.id AS contractId, c.academic_year AS academicYear,
        i.id AS instituteId, DATEDIFF(CURDATE(), ci.due_date) AS overdueDays
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      WHERE ci.status IN ('PENDING', 'PARTIAL')
        AND ci.due_date < CURDATE()
      ORDER BY ci.due_date ASC
      `,
    );
  }

  async recalculateInstallment(id: number) {
    const rows = await this.dataSource.query(
      `
      SELECT ci.id, ci.installment_amount AS installmentAmount,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS paidAmount
      FROM contract_installments ci
      LEFT JOIN contract_payments p ON p.installment_id = ci.id
      WHERE ci.id = ?
      GROUP BY ci.id
      `,
      [id],
    );

    const row = rows[0];
    if (!row) return;
    const amount = Number(row.installmentAmount || 0);
    const paid = this.round2(Number(row.paidAmount || 0));
    const remaining = this.round2(Math.max(amount - paid, 0));
    let status = InstallmentStatus.PENDING;
    if (paid >= amount) status = InstallmentStatus.PAID;
    else if (paid > 0) status = InstallmentStatus.PARTIAL;

    await this.installmentRepo.update(id, {
      paid_amount: paid,
      remaining_amount: remaining,
      status,
    });
  }
}
