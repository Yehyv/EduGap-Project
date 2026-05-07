import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContractStatus } from 'src/institute-annual-contracts/entities/institute-annual-contract.entity';

interface SettlementFilters {
  requesterRole?: string;
  requesterInstituteId?: number;
  selectedInstituteId?: number;
  academicYear?: number;
}

@Injectable()
export class AnnualSettlementsService {
  constructor(private readonly dataSource: DataSource) {}

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

  async findAll(filters: SettlementFilters = {}) {
    const params: unknown[] = [];
    let where = 'WHERE c.deleted_at IS NULL';

    const scopedInstituteId = this.isInstituteAdminRole(filters.requesterRole)
      ? filters.requesterInstituteId
      : filters.selectedInstituteId;

    if (scopedInstituteId && Number(scopedInstituteId) > 0) {
      where += ' AND i.id = ?';
      params.push(Number(scopedInstituteId));
    }

    if (filters.academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(filters.academicYear);
    }

    const rows = await this.dataSource.query(
      `
      SELECT c.id AS contractId, i.id AS instituteId, c.academic_year AS academicYear,
        sp.id AS planId, sp.plan_name AS planName,
        c.max_students_allowed AS maxStudentsAllowed,
        c.total_amount AS totalAmount, c.payment_percentage AS paymentPercentage,
        c.status AS contractStatus,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid,
        SUM(CASE WHEN ci.status IN ('PENDING', 'PARTIAL') AND ci.due_date < CURDATE() THEN 1 ELSE 0 END) AS overdueInstallments
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      LEFT JOIN \`user\` u ON u.annual_contract_id = c.id AND u.deletedAt IS NULL AND u.is_active = 1
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      LEFT JOIN contract_installments ci ON ci.contract_id = c.id
      ${where}
      GROUP BY c.id, i.id, sp.id
      ORDER BY c.id DESC
      `,
      params,
    );

    return { settlements: rows.map((row: any) => this.mapSettlement(row)) };
  }

  async findOne(contractId: number) {
    const rows = await this.dataSource.query(
      `
      SELECT c.id AS contractId, i.id AS instituteId, c.academic_year AS academicYear,
        sp.id AS planId, sp.plan_name AS planName,
        c.max_students_allowed AS maxStudentsAllowed,
        c.total_amount AS totalAmount, c.payment_percentage AS paymentPercentage,
        c.status AS contractStatus,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid,
        SUM(CASE WHEN ci.status IN ('PENDING', 'PARTIAL') AND ci.due_date < CURDATE() THEN 1 ELSE 0 END) AS overdueInstallments
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      LEFT JOIN \`user\` u ON u.annual_contract_id = c.id AND u.deletedAt IS NULL AND u.is_active = 1
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      LEFT JOIN contract_installments ci ON ci.contract_id = c.id
      WHERE c.id = ?
      GROUP BY c.id, i.id, sp.id
      `,
      [contractId],
    );

    if (!rows.length)
      throw new NotFoundException('Annual settlement not found');

    const installments = await this.dataSource.query(
      `
      SELECT id, installment_no AS installmentNo, due_date AS dueDate,
        installment_amount AS installmentAmount, paid_amount AS paidAmount,
        remaining_amount AS remainingAmount, status
      FROM contract_installments
      WHERE contract_id = ?
      ORDER BY installment_no ASC
      `,
      [contractId],
    );

    const payments = await this.dataSource.query(
      `
      SELECT id, installment_id AS installmentId, payment_date AS paymentDate,
        paid_amount AS paidAmount, payment_method AS paymentMethod,
        receipt_no AS receiptNo, status, created_at AS createdAt
      FROM contract_payments
      WHERE contract_id = ?
      ORDER BY id DESC
      `,
      [contractId],
    );

    return { ...this.mapSettlement(rows[0]), installments, payments };
  }

  async currentForInstitute(instituteId: number, academicYear?: number) {
    const year = academicYear ?? new Date().getFullYear();
    const rows = await this.dataSource.query(
      `
      SELECT id FROM institute_annual_contracts
      WHERE institute_id = ? AND academic_year = ? AND status = 'ACTIVE' AND deleted_at IS NULL
      ORDER BY id DESC LIMIT 1
      `,
      [instituteId, year],
    );
    if (!rows.length)
      throw new NotFoundException(
        'No active settlement found for current institute',
      );
    return this.findOne(Number(rows[0].id));
  }

  private mapSettlement(row: any) {
    const maxStudentsAllowed = Number(row.maxStudentsAllowed || 0);
    const addedStudents = Number(row.addedStudents || 0);
    const totalAmount = Number(row.totalAmount || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const totalRemaining = this.round2(Math.max(totalAmount - totalPaid, 0));
    const overdueInstallments = Number(row.overdueInstallments || 0);

    let settlementStatus = 'PENDING';
    if (row.contractStatus === ContractStatus.CLOSED)
      settlementStatus = 'CLOSED';
    else if (overdueInstallments > 0) settlementStatus = 'OVERDUE';
    else if (totalPaid >= totalAmount && totalAmount > 0)
      settlementStatus = 'FULLY_PAID';
    else if (totalPaid > 0) settlementStatus = 'PARTIALLY_PAID';

    return {
      contractId: Number(row.contractId),
      instituteId: Number(row.instituteId),
      academicYear: Number(row.academicYear),
      planId: Number(row.planId),
      planName: row.planName,
      maxStudentsAllowed,
      addedStudents,
      remainingStudents: Math.max(maxStudentsAllowed - addedStudents, 0),
      totalAmount: this.round2(totalAmount),
      totalPaid: this.round2(totalPaid),
      totalRemaining,
      paymentPercentage: Number(row.paymentPercentage || 0),
      contractStatus: row.contractStatus,
      settlementStatus,
      overdueInstallments,
    };
  }
}
