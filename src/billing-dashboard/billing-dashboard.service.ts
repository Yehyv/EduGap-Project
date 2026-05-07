import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BillingDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  async superAdmin(academicYear?: number) {
    const params: unknown[] = [];
    let yearFilter = '';
    if (academicYear) {
      yearFilter = ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    const totals = await this.dataSource.query(
      `
      SELECT COUNT(DISTINCT c.id) AS totalContracts,
        COALESCE(SUM(c.total_amount), 0) AS totalContractValue,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(SUM(c.max_students_allowed), 0) AS totalAllowedStudents
      FROM institute_annual_contracts c
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      LEFT JOIN \`user\` u ON u.annual_contract_id = c.id AND u.deletedAt IS NULL AND u.is_active = 1
      WHERE c.deleted_at IS NULL ${yearFilter}
      `,
      params,
    );

    const lateAndUpcoming = await this.dataSource.query(
      `
      SELECT
        SUM(CASE WHEN ci.status IN ('PENDING', 'PARTIAL') AND ci.due_date < CURDATE() THEN 1 ELSE 0 END) AS overdueInstallments,
        SUM(CASE WHEN ci.status IN ('PENDING', 'PARTIAL') AND ci.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY) THEN 1 ELSE 0 END) AS upcomingInstallments
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      WHERE c.deleted_at IS NULL ${yearFilter}
      `,
      params,
    );

    const row = totals[0] || {};
    const late = lateAndUpcoming[0] || {};
    const totalValue = Number(row.totalContractValue || 0);
    const totalPaid = Number(row.totalPaid || 0);

    return {
      totalContracts: Number(row.totalContracts || 0),
      totalContractValue: this.round2(totalValue),
      totalPaid: this.round2(totalPaid),
      totalRemaining: this.round2(Math.max(totalValue - totalPaid, 0)),
      collectionRate:
        totalValue > 0 ? this.round2((totalPaid / totalValue) * 100) : 0,
      overdueInstallments: Number(late.overdueInstallments || 0),
      upcomingInstallments: Number(late.upcomingInstallments || 0),
      addedStudents: Number(row.addedStudents || 0),
      remainingStudents: Math.max(
        Number(row.totalAllowedStudents || 0) - Number(row.addedStudents || 0),
        0,
      ),
    };
  }

  async institute(instituteId: number, academicYear?: number) {
    const year = academicYear ?? new Date().getFullYear();
    const rows = await this.dataSource.query(
      `
      SELECT c.id AS contractId, sp.plan_name AS currentPlan,
        c.max_students_allowed AS maxStudents, c.total_amount AS totalAmount,
        c.payment_percentage AS paymentPercentage,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS paidAmount
      FROM institute_annual_contracts c
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      LEFT JOIN \`user\` u ON u.annual_contract_id = c.id AND u.deletedAt IS NULL AND u.is_active = 1
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      WHERE c.institute_id = ? AND c.academic_year = ? AND c.status = 'ACTIVE' AND c.deleted_at IS NULL
      GROUP BY c.id, sp.id
      ORDER BY c.id DESC LIMIT 1
      `,
      [instituteId, year],
    );

    if (!rows.length) throw new NotFoundException('No active contract found');

    const row = rows[0];
    const nextRows = await this.dataSource.query(
      `
      SELECT id, installment_no AS installmentNo, due_date AS dueDate,
        remaining_amount AS remainingAmount
      FROM contract_installments
      WHERE contract_id = ? AND status IN ('PENDING', 'PARTIAL')
      ORDER BY due_date ASC LIMIT 1
      `,
      [row.contractId],
    );

    const totalAmount = Number(row.totalAmount || 0);
    const paidAmount = Number(row.paidAmount || 0);
    const addedStudents = Number(row.addedStudents || 0);
    const maxStudents = Number(row.maxStudents || 0);

    return {
      contractId: Number(row.contractId),
      currentPlan: row.currentPlan,
      maxStudents,
      addedStudents,
      remainingStudents: Math.max(maxStudents - addedStudents, 0),
      totalAmount: this.round2(totalAmount),
      paidAmount: this.round2(paidAmount),
      remainingAmount: this.round2(Math.max(totalAmount - paidAmount, 0)),
      paymentPercentage: Number(row.paymentPercentage || 0),
      nextInstallment: nextRows[0] || null,
      nextDueDate: nextRows[0]?.dueDate || null,
    };
  }
}
