import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CollectionSummaryQueryDto } from './dto/collection-summary-query.dto';

interface UpcomingPaymentRaw {
  instituteId: number | string;
  contractId: number | string;
  academicYear: number | string;
  installmentId: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  daysRemaining: number | string;
  status: string;
}

interface OverdueInstallmentRaw {
  instituteId: number | string;
  contractId: number | string;
  academicYear: number | string;
  installmentId: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  overdueDays: number | string;
  status: string;
}

interface CollectionSummaryRaw {
  totalContracts: number | string;
  totalContractValue: number | string;
  totalCollected: number | string;
  totalRemaining: number | string;
}

interface CollectionTrendRaw {
  monthNo: number | string;
  month: string;
  collected: number | string;
  remaining: number | string;
}

interface CollectionByPlanRaw {
  planId: number | string | null;
  planName: string | null;
  contracts: number | string;
  contractValue: number | string;
  collected: number | string;
  remaining: number | string;
}

interface PaymentPercentageRaw {
  instituteId: number | string;
  contractId: number | string;
  academicYear: number | string;
  totalAmount: number | string;
  totalPaid: number | string;
  paymentPercentage: number | string;
}

interface DiscountTaxRaw {
  contractId: number | string;
  academicYear: number | string;
  discountType: string | null;
  discountValue: number | string;
  discountAmount: number | string;
  taxPercentage: number | string;
  taxAmount: number | string;
}

interface AdministrativeFeesRaw {
  academicYear: number | string;
  contractsCount: number | string;
  totalAdministrativeFees: number | string;
}

interface YearlyRevenueRaw {
  academicYear: number | string;
  revenue: number | string;
}

interface AddedStudentsRaw {
  contractId: number | string;
  academicYear: number | string;
  instituteId: number | string;
  addedStudents: number | string;
  firstAddedAt: string | null;
  lastAddedAt: string | null;
}

type QueryParam = string | number;

@Injectable()
export class BillingReportsService {
  constructor(private readonly dataSource: DataSource) {}

  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  private normalizeDate(value?: string): string | undefined {
    return value?.trim() || undefined;
  }

  private buildCollectionWhere(query: CollectionSummaryQueryDto): {
    whereSql: string;
    params: QueryParam[];
  } {
    const conditions: string[] = ['c.deleted_at IS NULL'];
    const params: QueryParam[] = [];

    if (query.academicYear) {
      conditions.push('c.academic_year = ?');
      params.push(query.academicYear);
    }

    if (query.planId) {
      conditions.push('c.plan_id = ?');
      params.push(query.planId);
    }

    if (query.status?.trim()) {
      conditions.push('c.status = ?');
      params.push(query.status.trim());
    }

    const fromDate = this.normalizeDate(query.fromDate);
    const toDate = this.normalizeDate(query.toDate);

    if (fromDate) {
      conditions.push('c.contract_start_date >= ?');
      params.push(fromDate);
    }

    if (toDate) {
      conditions.push('c.contract_start_date <= ?');
      params.push(toDate);
    }

    return {
      whereSql: `WHERE ${conditions.join(' AND ')}`,
      params,
    };
  }

  private buildSettlementStatusFilter(query: CollectionSummaryQueryDto): {
    settlementStatusWhereSql: string;
    settlementStatusParams: QueryParam[];
  } {
    if (!query.settlementStatus?.trim()) {
      return {
        settlementStatusWhereSql: '',
        settlementStatusParams: [],
      };
    }

    return {
      settlementStatusWhereSql: 'WHERE settlementStatus = ?',
      settlementStatusParams: [query.settlementStatus.trim()],
    };
  }

  async upcomingPayments(days = 15) {
    const safeDays = Math.min(Math.max(Number(days) || 15, 1), 365);

    const rows = await this.dataSource.query<UpcomingPaymentRaw[]>(
      `
      SELECT
        i.id AS instituteId,
        c.id AS contractId,
        c.academic_year AS academicYear,
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount,
        ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount,
        DATEDIFF(ci.due_date, CURDATE()) AS daysRemaining,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      WHERE c.deleted_at IS NULL
        AND ci.status IN ('PENDING', 'PARTIAL')
        AND ci.remaining_amount > 0
        AND ci.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY ci.due_date ASC
      `,
      [safeDays],
    );

    return rows.map((row) => ({
      instituteId: Number(row.instituteId),
      contractId: Number(row.contractId),
      academicYear: Number(row.academicYear),
      installmentId: Number(row.installmentId),
      installmentNo: Number(row.installmentNo),
      dueDate: row.dueDate,
      installmentAmount: this.round2(Number(row.installmentAmount || 0)),
      paidAmount: this.round2(Number(row.paidAmount || 0)),
      remainingAmount: this.round2(Number(row.remainingAmount || 0)),
      daysRemaining: Number(row.daysRemaining || 0),
      status: row.status,
    }));
  }

  async overdueInstallments() {
    const rows = await this.dataSource.query<OverdueInstallmentRaw[]>(
      `
      SELECT
        i.id AS instituteId,
        c.id AS contractId,
        c.academic_year AS academicYear,
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount,
        ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount,
        DATEDIFF(CURDATE(), ci.due_date) AS overdueDays,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      WHERE c.deleted_at IS NULL
        AND ci.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
        AND ci.remaining_amount > 0
        AND ci.due_date < CURDATE()
      ORDER BY ci.due_date ASC
      `,
    );

    return rows.map((row) => ({
      instituteId: Number(row.instituteId),
      contractId: Number(row.contractId),
      academicYear: Number(row.academicYear),
      installmentId: Number(row.installmentId),
      installmentNo: Number(row.installmentNo),
      dueDate: row.dueDate,
      installmentAmount: this.round2(Number(row.installmentAmount || 0)),
      paidAmount: this.round2(Number(row.paidAmount || 0)),
      remainingAmount: this.round2(Number(row.remainingAmount || 0)),
      overdueDays: Number(row.overdueDays || 0),
      status: row.status,
    }));
  }

  async collectionSummary(query: CollectionSummaryQueryDto) {
    const { whereSql, params } = this.buildCollectionWhere(query);
    const { settlementStatusWhereSql, settlementStatusParams } =
      this.buildSettlementStatusFilter(query);

    const filteredContractsSql = `
      SELECT *
      FROM (
        SELECT
          c.id,
          c.academic_year,
          c.plan_id,
          c.status,
          c.contract_start_date,
          c.total_amount,
          COALESCE(payments.totalPaid, 0) AS totalPaid,
          GREATEST(c.total_amount - COALESCE(payments.totalPaid, 0), 0) AS totalRemaining,
          CASE
            WHEN c.status = 'CLOSED' THEN 'CLOSED'
            WHEN COALESCE(payments.totalPaid, 0) >= c.total_amount THEN 'FULLY_PAID'
            WHEN COALESCE(overdue.overdueInstallments, 0) > 0 THEN 'OVERDUE'
            WHEN COALESCE(payments.totalPaid, 0) > 0 THEN 'PARTIALLY_PAID'
            ELSE 'PENDING'
          END AS settlementStatus
        FROM institute_annual_contracts c
        LEFT JOIN (
          SELECT contract_id, SUM(paid_amount) AS totalPaid
          FROM contract_payments
          WHERE status = 'CONFIRMED'
          GROUP BY contract_id
        ) payments ON payments.contract_id = c.id
        LEFT JOIN (
          SELECT contract_id, COUNT(id) AS overdueInstallments
          FROM contract_installments
          WHERE status IN ('PENDING', 'PARTIAL', 'OVERDUE')
            AND remaining_amount > 0
            AND due_date < CURDATE()
          GROUP BY contract_id
        ) overdue ON overdue.contract_id = c.id
        ${whereSql}
      ) filtered
      ${settlementStatusWhereSql}
    `;

    const allParams = [...params, ...settlementStatusParams];

    const summaryRows = await this.dataSource.query<CollectionSummaryRaw[]>(
      `
      SELECT
        COUNT(filtered.id) AS totalContracts,
        COALESCE(SUM(filtered.total_amount), 0) AS totalContractValue,
        COALESCE(SUM(filtered.totalPaid), 0) AS totalCollected,
        COALESCE(SUM(filtered.totalRemaining), 0) AS totalRemaining
      FROM (${filteredContractsSql}) filtered
      `,
      allParams,
    );

    const summaryRow = summaryRows[0];

    const totalContracts = Number(summaryRow?.totalContracts || 0);
    const totalContractValue = Number(summaryRow?.totalContractValue || 0);
    const totalCollected = Number(summaryRow?.totalCollected || 0);
    const totalRemaining = Number(summaryRow?.totalRemaining || 0);

    const collectedPercentage =
      totalContractValue > 0
        ? this.round2((totalCollected / totalContractValue) * 100)
        : 0;

    const remainingPercentage =
      totalContractValue > 0
        ? this.round2((totalRemaining / totalContractValue) * 100)
        : 0;

    const trendRows = await this.dataSource.query<CollectionTrendRaw[]>(
      `
      SELECT
        MONTH(p.payment_date) AS monthNo,
        DATE_FORMAT(p.payment_date, '%b') AS month,
        COALESCE(SUM(p.paid_amount), 0) AS collected,
        0 AS remaining
      FROM contract_payments p
      INNER JOIN (${filteredContractsSql}) filtered ON filtered.id = p.contract_id
      WHERE p.status = 'CONFIRMED'
      GROUP BY MONTH(p.payment_date), DATE_FORMAT(p.payment_date, '%b')
      ORDER BY MONTH(p.payment_date)
      `,
      allParams,
    );

    const byPlanRows = await this.dataSource.query<CollectionByPlanRaw[]>(
      `
      SELECT
        sp.id AS planId,
        sp.plan_name AS planName,
        COUNT(filtered.id) AS contracts,
        COALESCE(SUM(filtered.total_amount), 0) AS contractValue,
        COALESCE(SUM(filtered.totalPaid), 0) AS collected,
        COALESCE(SUM(filtered.totalRemaining), 0) AS remaining
      FROM (${filteredContractsSql}) filtered
      LEFT JOIN subscription_plans sp ON sp.id = filtered.plan_id
      GROUP BY sp.id, sp.plan_name
      ORDER BY contractValue DESC
      `,
      allParams,
    );

    return {
      filters: {
        fromDate: query.fromDate ?? null,
        toDate: query.toDate ?? null,
        academicYear: query.academicYear ?? null,
        planId: query.planId ?? null,
        status: query.status ?? null,
        settlementStatus: query.settlementStatus ?? null,
      },
      summary: {
        totalContracts,
        totalContractValue: this.round2(totalContractValue),
        totalCollected: this.round2(totalCollected),
        totalRemaining: this.round2(totalRemaining),
        collectedPercentage,
        remainingPercentage,
      },
      collectionOverview: {
        collected: {
          amount: this.round2(totalCollected),
          percentage: collectedPercentage,
        },
        remaining: {
          amount: this.round2(totalRemaining),
          percentage: remainingPercentage,
        },
      },
      collectionTrend: trendRows.map((row) => ({
        monthNo: Number(row.monthNo),
        month: row.month,
        collected: this.round2(Number(row.collected || 0)),
        remaining: this.round2(Number(row.remaining || 0)),
      })),
      collectionByPlan: byPlanRows.map((row) => {
        const contractValue = Number(row.contractValue || 0);
        const collected = Number(row.collected || 0);
        const remaining = Number(row.remaining || 0);

        return {
          planId: row.planId ? Number(row.planId) : null,
          planName: row.planName ?? 'No Plan',
          contracts: Number(row.contracts || 0),
          contractValue: this.round2(contractValue),
          collected: this.round2(collected),
          remaining: this.round2(remaining),
          collectionPercentage:
            contractValue > 0
              ? this.round2((collected / contractValue) * 100)
              : 0,
        };
      }),
    };
  }

  async paymentPercentageReport(academicYear?: number) {
    const params: QueryParam[] = [];
    let where = 'WHERE c.deleted_at IS NULL';

    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    const rows = await this.dataSource.query<PaymentPercentageRaw[]>(
      `
      SELECT
        i.id AS instituteId,
        c.id AS contractId,
        c.academic_year AS academicYear,
        c.total_amount AS totalAmount,
        COALESCE(payments.totalPaid, 0) AS totalPaid,
        c.payment_percentage AS paymentPercentage
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN (
        SELECT contract_id, SUM(paid_amount) AS totalPaid
        FROM contract_payments
        WHERE status = 'CONFIRMED'
        GROUP BY contract_id
      ) payments ON payments.contract_id = c.id
      ${where}
      ORDER BY c.payment_percentage DESC
      `,
      params,
    );

    return rows.map((row) => ({
      instituteId: Number(row.instituteId),
      contractId: Number(row.contractId),
      academicYear: Number(row.academicYear),
      totalAmount: this.round2(Number(row.totalAmount || 0)),
      totalPaid: this.round2(Number(row.totalPaid || 0)),
      paymentPercentage: Number(row.paymentPercentage || 0),
    }));
  }

  async discountTaxReport(academicYear?: number) {
    const params: QueryParam[] = [];
    let where = 'WHERE c.deleted_at IS NULL';

    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    const rows = await this.dataSource.query<DiscountTaxRaw[]>(
      `
      SELECT
        c.id AS contractId,
        c.academic_year AS academicYear,
        c.discount_type AS discountType,
        c.discount_value AS discountValue,
        c.discount_amount AS discountAmount,
        c.tax_percentage AS taxPercentage,
        c.tax_amount AS taxAmount
      FROM institute_annual_contracts c
      ${where}
      ORDER BY c.id DESC
      `,
      params,
    );

    return rows.map((row) => ({
      contractId: Number(row.contractId),
      academicYear: Number(row.academicYear),
      discountType: row.discountType,
      discountValue: this.round2(Number(row.discountValue || 0)),
      discountAmount: this.round2(Number(row.discountAmount || 0)),
      taxPercentage: this.round2(Number(row.taxPercentage || 0)),
      taxAmount: this.round2(Number(row.taxAmount || 0)),
    }));
  }

  async administrativeFeesReport(academicYear?: number) {
    const params: QueryParam[] = [];
    let where = 'WHERE c.deleted_at IS NULL';

    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    const rows = await this.dataSource.query<AdministrativeFeesRaw[]>(
      `
      SELECT
        c.academic_year AS academicYear,
        COUNT(c.id) AS contractsCount,
        COALESCE(SUM(c.administrative_fees), 0) AS totalAdministrativeFees
      FROM institute_annual_contracts c
      ${where}
      GROUP BY c.academic_year
      ORDER BY c.academic_year DESC
      `,
      params,
    );

    return rows.map((row) => ({
      academicYear: Number(row.academicYear),
      contractsCount: Number(row.contractsCount || 0),
      totalAdministrativeFees: this.round2(
        Number(row.totalAdministrativeFees || 0),
      ),
    }));
  }

  async yearlyRevenue() {
    const rows = await this.dataSource.query<YearlyRevenueRaw[]>(
      `
      SELECT
        c.academic_year AS academicYear,
        COALESCE(SUM(payments.totalPaid), 0) AS revenue
      FROM institute_annual_contracts c
      LEFT JOIN (
        SELECT contract_id, SUM(paid_amount) AS totalPaid
        FROM contract_payments
        WHERE status = 'CONFIRMED'
        GROUP BY contract_id
      ) payments ON payments.contract_id = c.id
      WHERE c.deleted_at IS NULL
      GROUP BY c.academic_year
      ORDER BY c.academic_year DESC
      `,
    );

    return rows.map((row) => ({
      academicYear: Number(row.academicYear),
      revenue: this.round2(Number(row.revenue || 0)),
    }));
  }

  async addedStudentsReport(academicYear?: number) {
    const params: QueryParam[] = [];
    let where =
      'WHERE u.deletedAt IS NULL AND u.annual_contract_id IS NOT NULL';

    if (academicYear) {
      where += ' AND c.academic_year = ?';
      params.push(academicYear);
    }

    const rows = await this.dataSource.query<AddedStudentsRaw[]>(
      `
      SELECT
        c.id AS contractId,
        c.academic_year AS academicYear,
        i.id AS instituteId,
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

    return rows.map((row) => ({
      contractId: Number(row.contractId),
      academicYear: Number(row.academicYear),
      instituteId: Number(row.instituteId),
      addedStudents: Number(row.addedStudents || 0),
      firstAddedAt: row.firstAddedAt,
      lastAddedAt: row.lastAddedAt,
    }));
  }
}