import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BillingReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async upcomingPayments(days = 15) {
    const safeDays = Math.min(Math.max(Number(days) || 15, 1), 365);
    return this.dataSource.query(
      `
      SELECT i.id AS instituteId, c.id AS contractId, c.academic_year AS academicYear,
        ci.id AS installmentId, ci.installment_no AS installmentNo, ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount, ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount, DATEDIFF(ci.due_date, CURDATE()) AS daysRemaining,
        ci.status
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

  async overdueInstallments() {
    return this.dataSource.query(
      `
      SELECT i.id AS instituteId, c.id AS contractId, c.academic_year AS academicYear,
        ci.id AS installmentId, ci.installment_no AS installmentNo, ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount, ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount, DATEDIFF(CURDATE(), ci.due_date) AS overdueDays,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      WHERE ci.status IN ('PENDING', 'PARTIAL') AND ci.due_date < CURDATE()
      ORDER BY ci.due_date ASC
      `,
    );
  }

  async collectionSummary(academicYear?: number) {
    const params: unknown[] = [];
    let where = 'WHERE c.deleted_at IS NULL';
    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    return this.dataSource.query(
      `
      SELECT c.academic_year AS academicYear, COUNT(DISTINCT c.id) AS contractsCount,
        COALESCE(SUM(c.total_amount), 0) AS totalContractValue,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid,
        COALESCE(SUM(c.total_amount), 0) -
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalRemaining
      FROM institute_annual_contracts c
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      ${where}
      GROUP BY c.academic_year
      ORDER BY c.academic_year DESC
      `,
      params,
    );
  }

  async paymentPercentageReport(academicYear?: number) {
    const params: unknown[] = [];
    let where = 'WHERE c.deleted_at IS NULL';
    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    return this.dataSource.query(
      `
      SELECT i.id AS instituteId, c.id AS contractId, c.academic_year AS academicYear,
        c.total_amount AS totalAmount,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid,
        c.payment_percentage AS paymentPercentage
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      ${where}
      GROUP BY c.id, i.id
      ORDER BY c.payment_percentage DESC
      `,
      params,
    );
  }

  async discountTaxReport(academicYear?: number) {
    const params: unknown[] = [];
    let where = 'WHERE c.deleted_at IS NULL';
    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    return this.dataSource.query(
      `
      SELECT c.id AS contractId, c.academic_year AS academicYear,
        c.discount_type AS discountType, c.discount_value AS discountValue,
        c.discount_amount AS discountAmount,
        c.tax_percentage AS taxPercentage, c.tax_amount AS taxAmount
      FROM institute_annual_contracts c
      ${where}
      ORDER BY c.id DESC
      `,
      params,
    );
  }

  async administrativeFeesReport(academicYear?: number) {
    const params: unknown[] = [];
    let where = 'WHERE c.deleted_at IS NULL';
    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    return this.dataSource.query(
      `
      SELECT c.academic_year AS academicYear, COUNT(c.id) AS contractsCount,
        COALESCE(SUM(c.administrative_fees), 0) AS totalAdministrativeFees
      FROM institute_annual_contracts c
      ${where}
      GROUP BY c.academic_year
      ORDER BY c.academic_year DESC
      `,
      params,
    );
  }

  async yearlyRevenue() {
    return this.dataSource.query(
      `
      SELECT c.academic_year AS academicYear,
        COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS revenue
      FROM institute_annual_contracts c
      LEFT JOIN contract_payments p ON p.contract_id = c.id
      WHERE c.deleted_at IS NULL
      GROUP BY c.academic_year
      ORDER BY c.academic_year DESC
      `,
    );
  }

  async addedStudentsReport(academicYear?: number) {
    const params: unknown[] = [];
    let where =
      'WHERE u.deletedAt IS NULL AND u.annual_contract_id IS NOT NULL';
    if (academicYear) {
      where += ' AND u.academic_year = ?';
      params.push(academicYear);
    }

    return this.dataSource.query(
      `
      SELECT c.id AS contractId, c.academic_year AS academicYear, i.id AS instituteId,
        COUNT(u.id) AS addedStudents,
        MIN(u.added_to_contract_at) AS firstAddedAt,
        MAX(u.added_to_contract_at) AS lastAddedAt
      FROM \`user\` u
      INNER JOIN institute_annual_contracts c ON c.id = u.annual_contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      ${where}
      GROUP BY c.id, i.id
      ORDER BY c.academic_year DESC, addedStudents DESC
      `,
      params,
    );
  }
}
