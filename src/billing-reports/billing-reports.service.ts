import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { AdministrativeFeesQueryDto } from './dto/administrative-fees-query.dto';
import { CollectionSummaryQueryDto } from './dto/collection-summary-query.dto';
import { DiscountTaxQueryDto } from './dto/discount-tax-query.dto';
import {
  ExportFinancialReportQueryDto,
  FinancialReportType,
} from './dto/export-financial-report-query.dto';
import { OverdueInstallmentsQueryDto } from './dto/overdue-installments-query.dto';
import { PaymentPercentageQueryDto } from './dto/payment-percentage-query.dto';
import { UpcomingPaymentsQueryDto } from './dto/upcoming-payments-query.dto';
import { YearlyRevenueQueryDto } from './dto/yearly-revenue-query.dto';

interface ReportPagination {
  page: number;
  limit: number;
  offset: number;
}

interface OverdueInstallmentReportRaw {
  instituteId: number | string;
  instituteName: string | null;
  contractId: number | string;
  contractNo: string;
  academicYear: number | string;
  planId: number | string | null;
  planName: string | null;
  installmentId: number | string;
  installmentNo: number | string;
  dueDate: string;
  overdueDays: number | string;
  overdueAmount: number | string;
  status: string;
}

interface OverdueInstallmentSummaryRaw {
  overdueContracts: number | string;
  overdueInstallments: number | string;
  totalOverdueAmount: number | string;
}

interface UpcomingPaymentReportRaw {
  instituteId: number | string;
  instituteName: string | null;
  contractId: number | string;
  contractNo: string;
  academicYear: number | string;
  planId: number | string | null;
  planName: string | null;
  installmentId: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentAmount: number | string;
  remainingAmount: number | string;
  daysLeft: number | string;
  status: string;
}

interface UpcomingPaymentSummaryRaw {
  upcomingInstallments: number | string;
  totalDueAmount: number | string;
  next7DaysCount: number | string;
  next7DaysAmount: number | string;
  next30DaysCount: number | string;
  next30DaysAmount: number | string;
}

interface CollectionSummaryRaw {
  totalContracts: number | string;
  totalContractValue: number | string;
  totalCollected: number | string;
  totalRemaining: number | string;
}

interface CollectionTrendRaw {
  year: number | string;
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

interface PaymentPercentageReportRaw {
  instituteId: number | string;
  instituteName: string | null;
  contractId: number | string;
  contractNo: string;
  academicYear: number | string;
  planId: number | string | null;
  planName: string | null;
  contractValue: number | string;
  collected: number | string;
  remaining: number | string;
  collectionPercentage: number | string;
  status: string;
}

interface PaymentPercentageSummaryRaw {
  totalContracts: number | string;
  averageCollectionPercentage: number | string;
  fullyPaidContracts: number | string;
  partiallyPaidContracts: number | string;
  notPaidOrOverdueContracts: number | string;
}

interface DiscountTaxReportRaw {
  planId: number | string | null;
  planName: string | null;
  contracts: number | string;
  contractValue: number | string;
  discountAmount: number | string;
  discountPercentage: number | string;
  taxAmount: number | string;
  amountAfterDiscount: number | string;
  amountAfterTax: number | string;
}

interface DiscountTaxSummaryRaw {
  totalDiscounts: number | string;
  totalTaxAmount: number | string;
  totalAmountAfterDiscount: number | string;
  totalAmountAfterTax: number | string;
}

interface AdministrativeFeesReportRaw {
  planId: number | string | null;
  planName: string | null;
  contracts: number | string;
  administrativeFees: number | string;
  averageFeePerContract: number | string;
  percentageOfContractValue: number | string;
}

interface AdministrativeFeesSummaryRaw {
  totalAdministrativeFees: number | string;
  contractsIncluded: number | string;
  averageFeePerContract: number | string;
  percentageOfTotalValue: number | string;
}

interface YearlyRevenueMonthRaw {
  monthNo: number | string;
  month: string;
  contractValue: number | string;
  collected: number | string;
}

interface YearlyRevenuePlanRaw {
  planId: number | string | null;
  planName: string | null;
  revenue: number | string;
  percentage: number | string;
}

interface YearlyRevenueSummaryRaw {
  totalRevenue: number | string;
  totalCollected: number | string;
  totalRemaining: number | string;
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

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private addDays(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  private getPagination(pageRaw?: number, limitRaw?: number): ReportPagination {
    const page = Math.max(Number(pageRaw || 1), 1);
    const limit = Math.min(Math.max(Number(limitRaw || 10), 1), 100);

    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
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

  async overdueInstallments(query: OverdueInstallmentsQueryDto) {
    const asOfDate = query.asOfDate?.trim() || this.todayDate();
    const pagination = this.getPagination(query.page, query.limit);

    const conditions: string[] = [
      'c.deleted_at IS NULL',
      "ci.status IN ('PENDING', 'PARTIAL', 'OVERDUE')",
      'ci.remaining_amount > 0',
      'ci.due_date < ?',
    ];

    const params: QueryParam[] = [asOfDate];

    if (query.planId) {
      conditions.push('c.plan_id = ?');
      params.push(query.planId);
    }

    if (query.overdueDays) {
      conditions.push('DATEDIFF(?, ci.due_date) >= ?');
      params.push(asOfDate, query.overdueDays);
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows = await this.dataSource.query<
      OverdueInstallmentSummaryRaw[]
    >(
      `
        SELECT
          COUNT(DISTINCT c.id) AS overdueContracts,
          COUNT(ci.id) AS overdueInstallments,
          COALESCE(SUM(ci.remaining_amount), 0) AS totalOverdueAmount
        FROM contract_installments ci
        INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
        INNER JOIN institute i ON i.id = c.institute_id
        LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
        ${whereSql}
        `,
      params,
    );

    const totalRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(
      `
      SELECT COUNT(ci.id) AS total
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      `,
      params,
    );

    const rows = await this.dataSource.query<OverdueInstallmentReportRaw[]>(
      `
      SELECT
        i.id AS instituteId,
        i.email AS instituteName,
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        c.academic_year AS academicYear,
        sp.id AS planId,
        sp.plan_name AS planName,
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        DATEDIFF(?, ci.due_date) AS overdueDays,
        ci.remaining_amount AS overdueAmount,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      ORDER BY ci.due_date ASC
      LIMIT ? OFFSET ?
      `,
      [asOfDate, ...params, pagination.limit, pagination.offset],
    );

    const summary = summaryRows[0];
    const total = Number(totalRows[0]?.total || 0);

    return {
      filters: {
        asOfDate,
        planId: query.planId ?? null,
        overdueDays: query.overdueDays ?? null,
      },
      summary: {
        overdueContracts: Number(summary?.overdueContracts || 0),
        overdueInstallments: Number(summary?.overdueInstallments || 0),
        totalOverdueAmount: this.round2(
          Number(summary?.totalOverdueAmount || 0),
        ),
      },
      data: rows.map((row) => ({
        instituteId: Number(row.instituteId),
        instituteName: row.instituteName,
        contractId: Number(row.contractId),
        contractNo: row.contractNo,
        academicYear: Number(row.academicYear),
        planId: row.planId ? Number(row.planId) : null,
        planName: row.planName,
        installmentId: Number(row.installmentId),
        installmentNo: Number(row.installmentNo),
        dueDate: row.dueDate,
        overdueDays: Number(row.overdueDays || 0),
        overdueAmount: this.round2(Number(row.overdueAmount || 0)),
        status: row.status,
      })),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
        count: rows.length,
      },
    };
  }

  async upcomingPayments(query: UpcomingPaymentsQueryDto) {
    const dueFrom = query.dueFrom?.trim() || this.todayDate();
    const dueTo = query.dueTo?.trim() || this.addDays(dueFrom, 30);
    const pagination = this.getPagination(query.page, query.limit);

    const conditions: string[] = [
      'c.deleted_at IS NULL',
      "ci.status IN ('PENDING', 'PARTIAL')",
      'ci.remaining_amount > 0',
      'ci.due_date BETWEEN ? AND ?',
    ];

    const params: QueryParam[] = [dueFrom, dueTo];

    if (query.planId) {
      conditions.push('c.plan_id = ?');
      params.push(query.planId);
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows = await this.dataSource.query<
      UpcomingPaymentSummaryRaw[]
    >(
      `
      SELECT
        COUNT(ci.id) AS upcomingInstallments,
        COALESCE(SUM(ci.remaining_amount), 0) AS totalDueAmount,
        COALESCE(SUM(CASE WHEN ci.due_date BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY) THEN 1 ELSE 0 END), 0) AS next7DaysCount,
        COALESCE(SUM(CASE WHEN ci.due_date BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY) THEN ci.remaining_amount ELSE 0 END), 0) AS next7DaysAmount,
        COALESCE(SUM(CASE WHEN ci.due_date BETWEEN ? AND DATE_ADD(?, INTERVAL 30 DAY) THEN 1 ELSE 0 END), 0) AS next30DaysCount,
        COALESCE(SUM(CASE WHEN ci.due_date BETWEEN ? AND DATE_ADD(?, INTERVAL 30 DAY) THEN ci.remaining_amount ELSE 0 END), 0) AS next30DaysAmount
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      `,
      [
        dueFrom,
        dueFrom,
        dueFrom,
        dueFrom,
        dueFrom,
        dueFrom,
        dueFrom,
        dueFrom,
        ...params,
      ],
    );

    const totalRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(
      `
      SELECT COUNT(ci.id) AS total
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      `,
      params,
    );

    const rows = await this.dataSource.query<UpcomingPaymentReportRaw[]>(
      `
      SELECT
        i.id AS instituteId,
        i.email AS instituteName,
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        c.academic_year AS academicYear,
        sp.id AS planId,
        sp.plan_name AS planName,
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount,
        ci.remaining_amount AS remainingAmount,
        DATEDIFF(ci.due_date, ?) AS daysLeft,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      ORDER BY ci.due_date ASC
      LIMIT ? OFFSET ?
      `,
      [dueFrom, ...params, pagination.limit, pagination.offset],
    );

    const summary = summaryRows[0];
    const total = Number(totalRows[0]?.total || 0);

    return {
      filters: {
        dueFrom,
        dueTo,
        planId: query.planId ?? null,
      },
      summary: {
        upcomingInstallments: Number(summary?.upcomingInstallments || 0),
        totalDueAmount: this.round2(Number(summary?.totalDueAmount || 0)),
        next7Days: {
          count: Number(summary?.next7DaysCount || 0),
          amount: this.round2(Number(summary?.next7DaysAmount || 0)),
        },
        next30Days: {
          count: Number(summary?.next30DaysCount || 0),
          amount: this.round2(Number(summary?.next30DaysAmount || 0)),
        },
      },
      data: rows.map((row) => {
        const daysLeft = Number(row.daysLeft || 0);

        return {
          instituteId: Number(row.instituteId),
          instituteName: row.instituteName,
          contractId: Number(row.contractId),
          contractNo: row.contractNo,
          academicYear: Number(row.academicYear),
          planId: row.planId ? Number(row.planId) : null,
          planName: row.planName,
          installmentId: Number(row.installmentId),
          installmentNo: Number(row.installmentNo),
          dueDate: row.dueDate,
          installmentAmount: this.round2(Number(row.installmentAmount || 0)),
          remainingAmount: this.round2(Number(row.remainingAmount || 0)),
          daysLeft,
          status: daysLeft <= 7 ? 'DUE_SOON' : 'UPCOMING',
        };
      }),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
        count: rows.length,
      },
    };
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
        YEAR(p.payment_date) AS year,
        MONTH(p.payment_date) AS monthNo,
        DATE_FORMAT(p.payment_date, '%b') AS month,
        COALESCE(SUM(p.paid_amount), 0) AS collected,
        0 AS remaining
      FROM contract_payments p
      INNER JOIN (${filteredContractsSql}) filtered ON filtered.id = p.contract_id
      WHERE p.status = 'CONFIRMED'
      GROUP BY YEAR(p.payment_date), MONTH(p.payment_date), DATE_FORMAT(p.payment_date, '%b')
      ORDER BY YEAR(p.payment_date), MONTH(p.payment_date)
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
        year: Number(row.year),
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

  async paymentPercentageReport(query: PaymentPercentageQueryDto) {
    const pagination = this.getPagination(query.page, query.limit);

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

    const whereSql = `WHERE ${conditions.join(' AND ')}`;

    const filteredContractsSql = `
      SELECT *
      FROM (
        SELECT
          c.id,
          c.academic_year,
          c.plan_id,
          c.total_amount,
          COALESCE(payments.totalPaid, 0) AS collected,
          GREATEST(c.total_amount - COALESCE(payments.totalPaid, 0), 0) AS remaining,
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
      ${query.settlementStatus?.trim() ? 'WHERE settlementStatus = ?' : ''}
    `;

    const allParams = query.settlementStatus?.trim()
      ? [...params, query.settlementStatus.trim()]
      : params;

    const summaryRows = await this.dataSource.query<
      PaymentPercentageSummaryRaw[]
    >(
      `
        SELECT
          COUNT(filtered.id) AS totalContracts,
          COALESCE(AVG(CASE WHEN filtered.total_amount > 0 THEN (filtered.collected / filtered.total_amount) * 100 ELSE 0 END), 0) AS averageCollectionPercentage,
          COALESCE(SUM(CASE WHEN filtered.settlementStatus = 'FULLY_PAID' THEN 1 ELSE 0 END), 0) AS fullyPaidContracts,
          COALESCE(SUM(CASE WHEN filtered.settlementStatus = 'PARTIALLY_PAID' THEN 1 ELSE 0 END), 0) AS partiallyPaidContracts,
          COALESCE(SUM(CASE WHEN filtered.settlementStatus IN ('PENDING', 'OVERDUE') THEN 1 ELSE 0 END), 0) AS notPaidOrOverdueContracts
        FROM (${filteredContractsSql}) filtered
        `,
      allParams,
    );

    const totalRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(
      `
      SELECT COUNT(filtered.id) AS total
      FROM (${filteredContractsSql}) filtered
      `,
      allParams,
    );

    const rows = await this.dataSource.query<PaymentPercentageReportRaw[]>(
      `
      SELECT
        i.id AS instituteId,
        i.email AS instituteName,
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        c.academic_year AS academicYear,
        sp.id AS planId,
        sp.plan_name AS planName,
        filtered.total_amount AS contractValue,
        filtered.collected,
        filtered.remaining,
        CASE
          WHEN filtered.total_amount > 0 THEN (filtered.collected / filtered.total_amount) * 100
          ELSE 0
        END AS collectionPercentage,
        filtered.settlementStatus AS status
      FROM (${filteredContractsSql}) filtered
      INNER JOIN institute_annual_contracts c ON c.id = filtered.id
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ORDER BY collectionPercentage DESC
      LIMIT ? OFFSET ?
      `,
      [...allParams, pagination.limit, pagination.offset],
    );

    const summary = summaryRows[0];
    const total = Number(totalRows[0]?.total || 0);

    return {
      filters: {
        academicYear: query.academicYear ?? null,
        planId: query.planId ?? null,
        settlementStatus: query.settlementStatus ?? null,
      },
      summary: {
        totalContracts: Number(summary?.totalContracts || 0),
        averageCollectionPercentage: this.round2(
          Number(summary?.averageCollectionPercentage || 0),
        ),
        fullyPaidContracts: Number(summary?.fullyPaidContracts || 0),
        partiallyPaidContracts: Number(summary?.partiallyPaidContracts || 0),
        notPaidOrOverdueContracts: Number(
          summary?.notPaidOrOverdueContracts || 0,
        ),
      },
      data: rows.map((row) => ({
        instituteId: Number(row.instituteId),
        instituteName: row.instituteName,
        contractId: Number(row.contractId),
        contractNo: row.contractNo,
        academicYear: Number(row.academicYear),
        planId: row.planId ? Number(row.planId) : null,
        planName: row.planName,
        contractValue: this.round2(Number(row.contractValue || 0)),
        collected: this.round2(Number(row.collected || 0)),
        remaining: this.round2(Number(row.remaining || 0)),
        collectionPercentage: this.round2(
          Number(row.collectionPercentage || 0),
        ),
        status: row.status,
      })),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
        count: rows.length,
      },
    };
  }

  async discountTaxReport(query: DiscountTaxQueryDto) {
    const pagination = this.getPagination(query.page, query.limit);

    const conditions: string[] = ['c.deleted_at IS NULL'];
    const params: QueryParam[] = [];

    if (query.fromDate?.trim()) {
      conditions.push('c.contract_start_date >= ?');
      params.push(query.fromDate.trim());
    }

    if (query.toDate?.trim()) {
      conditions.push('c.contract_start_date <= ?');
      params.push(query.toDate.trim());
    }

    if (query.planId) {
      conditions.push('c.plan_id = ?');
      params.push(query.planId);
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows = await this.dataSource.query<DiscountTaxSummaryRaw[]>(
      `
      SELECT
        COALESCE(SUM(c.discount_amount), 0) AS totalDiscounts,
        COALESCE(SUM(c.tax_amount), 0) AS totalTaxAmount,
        COALESCE(SUM(c.amount_after_discount), 0) AS totalAmountAfterDiscount,
        COALESCE(SUM(c.total_amount), 0) AS totalAmountAfterTax
      FROM institute_annual_contracts c
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      `,
      params,
    );

    const totalRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(
      `
      SELECT COUNT(DISTINCT c.plan_id) AS total
      FROM institute_annual_contracts c
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      `,
      params,
    );

    const rows = await this.dataSource.query<DiscountTaxReportRaw[]>(
      `
      SELECT
        sp.id AS planId,
        COALESCE(sp.plan_name, 'No Plan') AS planName,
        COUNT(c.id) AS contracts,
        COALESCE(SUM(c.package_amount), 0) AS contractValue,
        COALESCE(SUM(c.discount_amount), 0) AS discountAmount,
        CASE
          WHEN COALESCE(SUM(c.package_amount), 0) > 0
          THEN (COALESCE(SUM(c.discount_amount), 0) / COALESCE(SUM(c.package_amount), 0)) * 100
          ELSE 0
        END AS discountPercentage,
        COALESCE(SUM(c.tax_amount), 0) AS taxAmount,
        COALESCE(SUM(c.amount_after_discount), 0) AS amountAfterDiscount,
        COALESCE(SUM(c.total_amount), 0) AS amountAfterTax
      FROM institute_annual_contracts c
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      GROUP BY sp.id, sp.plan_name
      ORDER BY amountAfterTax DESC
      LIMIT ? OFFSET ?
      `,
      [...params, pagination.limit, pagination.offset],
    );

    const summary = summaryRows[0];
    const total = Number(totalRows[0]?.total || 0);

    return {
      filters: {
        fromDate: query.fromDate ?? null,
        toDate: query.toDate ?? null,
        planId: query.planId ?? null,
      },
      summary: {
        totalDiscounts: this.round2(Number(summary?.totalDiscounts || 0)),
        totalTaxAmount: this.round2(Number(summary?.totalTaxAmount || 0)),
        totalAmountAfterDiscount: this.round2(
          Number(summary?.totalAmountAfterDiscount || 0),
        ),
        totalAmountAfterTax: this.round2(
          Number(summary?.totalAmountAfterTax || 0),
        ),
      },
      data: rows.map((row) => ({
        planId: row.planId ? Number(row.planId) : null,
        planName: row.planName,
        contracts: Number(row.contracts || 0),
        contractValue: this.round2(Number(row.contractValue || 0)),
        discountAmount: this.round2(Number(row.discountAmount || 0)),
        discountPercentage: this.round2(Number(row.discountPercentage || 0)),
        taxAmount: this.round2(Number(row.taxAmount || 0)),
        amountAfterDiscount: this.round2(Number(row.amountAfterDiscount || 0)),
        amountAfterTax: this.round2(Number(row.amountAfterTax || 0)),
      })),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
        count: rows.length,
      },
    };
  }

  async administrativeFeesReport(query: AdministrativeFeesQueryDto) {
    const pagination = this.getPagination(query.page, query.limit);

    const conditions: string[] = ['c.deleted_at IS NULL'];
    const params: QueryParam[] = [];

    if (query.fromDate?.trim()) {
      conditions.push('c.contract_start_date >= ?');
      params.push(query.fromDate.trim());
    }

    if (query.toDate?.trim()) {
      conditions.push('c.contract_start_date <= ?');
      params.push(query.toDate.trim());
    }

    if (query.planId) {
      conditions.push('c.plan_id = ?');
      params.push(query.planId);
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows = await this.dataSource.query<
      AdministrativeFeesSummaryRaw[]
    >(
      `
        SELECT
          COALESCE(SUM(c.administrative_fees), 0) AS totalAdministrativeFees,
          COUNT(c.id) AS contractsIncluded,
          CASE
            WHEN COUNT(c.id) > 0
            THEN COALESCE(SUM(c.administrative_fees), 0) / COUNT(c.id)
            ELSE 0
          END AS averageFeePerContract,
          CASE
            WHEN COALESCE(SUM(c.total_amount), 0) > 0
            THEN (COALESCE(SUM(c.administrative_fees), 0) / COALESCE(SUM(c.total_amount), 0)) * 100
            ELSE 0
          END AS percentageOfTotalValue
        FROM institute_annual_contracts c
        LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
        ${whereSql}
        `,
      params,
    );

    const totalRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(
      `
      SELECT COUNT(DISTINCT c.plan_id) AS total
      FROM institute_annual_contracts c
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      `,
      params,
    );

    const rows = await this.dataSource.query<AdministrativeFeesReportRaw[]>(
      `
      SELECT
        sp.id AS planId,
        COALESCE(sp.plan_name, 'No Plan') AS planName,
        COUNT(c.id) AS contracts,
        COALESCE(SUM(c.administrative_fees), 0) AS administrativeFees,
        CASE
          WHEN COUNT(c.id) > 0
          THEN COALESCE(SUM(c.administrative_fees), 0) / COUNT(c.id)
          ELSE 0
        END AS averageFeePerContract,
        CASE
          WHEN COALESCE(SUM(c.total_amount), 0) > 0
          THEN (COALESCE(SUM(c.administrative_fees), 0) / COALESCE(SUM(c.total_amount), 0)) * 100
          ELSE 0
        END AS percentageOfContractValue
      FROM institute_annual_contracts c
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      ${whereSql}
      GROUP BY sp.id, sp.plan_name
      ORDER BY administrativeFees DESC
      LIMIT ? OFFSET ?
      `,
      [...params, pagination.limit, pagination.offset],
    );

    const summary = summaryRows[0];
    const total = Number(totalRows[0]?.total || 0);

    return {
      filters: {
        fromDate: query.fromDate ?? null,
        toDate: query.toDate ?? null,
        planId: query.planId ?? null,
      },
      summary: {
        totalAdministrativeFees: this.round2(
          Number(summary?.totalAdministrativeFees || 0),
        ),
        contractsIncluded: Number(summary?.contractsIncluded || 0),
        averageFeePerContract: this.round2(
          Number(summary?.averageFeePerContract || 0),
        ),
        percentageOfTotalValue: this.round2(
          Number(summary?.percentageOfTotalValue || 0),
        ),
      },
      data: rows.map((row) => ({
        planId: row.planId ? Number(row.planId) : null,
        planName: row.planName,
        contracts: Number(row.contracts || 0),
        administrativeFees: this.round2(Number(row.administrativeFees || 0)),
        averageFeePerContract: this.round2(
          Number(row.averageFeePerContract || 0),
        ),
        percentageOfContractValue: this.round2(
          Number(row.percentageOfContractValue || 0),
        ),
      })),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
        count: rows.length,
      },
    };
  }

  async yearlyRevenue(query: YearlyRevenueQueryDto) {
    const academicYear = query.academicYear ?? new Date().getFullYear();

    const conditions: string[] = [
      'c.deleted_at IS NULL',
      'c.academic_year = ?',
    ];

    const params: QueryParam[] = [academicYear];

    if (query.planId) {
      conditions.push('c.plan_id = ?');
      params.push(query.planId);
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows = await this.dataSource.query<YearlyRevenueSummaryRaw[]>(
      `
      SELECT
        COALESCE(SUM(c.total_amount), 0) AS totalRevenue,
        COALESCE(SUM(payments.totalPaid), 0) AS totalCollected,
        COALESCE(SUM(GREATEST(c.total_amount - COALESCE(payments.totalPaid, 0), 0)), 0) AS totalRemaining
      FROM institute_annual_contracts c
      LEFT JOIN (
        SELECT contract_id, SUM(paid_amount) AS totalPaid
        FROM contract_payments
        WHERE status = 'CONFIRMED'
        GROUP BY contract_id
      ) payments ON payments.contract_id = c.id
      ${whereSql}
      `,
      params,
    );

    const monthRows = await this.dataSource.query<YearlyRevenueMonthRaw[]>(
      `
      SELECT
        months.monthNo,
        months.month,
        COALESCE(SUM(c.total_amount), 0) AS contractValue,
        COALESCE(SUM(monthPayments.collected), 0) AS collected
      FROM (
        SELECT 1 AS monthNo, 'Jan' AS month UNION ALL
        SELECT 2, 'Feb' UNION ALL
        SELECT 3, 'Mar' UNION ALL
        SELECT 4, 'Apr' UNION ALL
        SELECT 5, 'May' UNION ALL
        SELECT 6, 'Jun' UNION ALL
        SELECT 7, 'Jul' UNION ALL
        SELECT 8, 'Aug' UNION ALL
        SELECT 9, 'Sep' UNION ALL
        SELECT 10, 'Oct' UNION ALL
        SELECT 11, 'Nov' UNION ALL
        SELECT 12, 'Dec'
      ) months
      LEFT JOIN institute_annual_contracts c
        ON MONTH(c.contract_start_date) = months.monthNo
        AND c.deleted_at IS NULL
        AND c.academic_year = ?
        ${query.planId ? 'AND c.plan_id = ?' : ''}
      LEFT JOIN (
        SELECT
          p.contract_id,
          MONTH(p.payment_date) AS paymentMonth,
          SUM(p.paid_amount) AS collected
        FROM contract_payments p
        WHERE p.status = 'CONFIRMED'
        GROUP BY p.contract_id, MONTH(p.payment_date)
      ) monthPayments
        ON monthPayments.contract_id = c.id
        AND monthPayments.paymentMonth = months.monthNo
      GROUP BY months.monthNo, months.month
      ORDER BY months.monthNo
      `,
      query.planId ? [academicYear, query.planId] : [academicYear],
    );

    const planRows = await this.dataSource.query<YearlyRevenuePlanRaw[]>(
      `
      SELECT
        sp.id AS planId,
        COALESCE(sp.plan_name, 'No Plan') AS planName,
        COALESCE(SUM(c.total_amount), 0) AS revenue,
        CASE
          WHEN total.totalRevenue > 0
          THEN (COALESCE(SUM(c.total_amount), 0) / total.totalRevenue) * 100
          ELSE 0
        END AS percentage
      FROM institute_annual_contracts c
      LEFT JOIN subscription_plans sp ON sp.id = c.plan_id
      CROSS JOIN (
        SELECT COALESCE(SUM(c2.total_amount), 0) AS totalRevenue
        FROM institute_annual_contracts c2
        WHERE c2.deleted_at IS NULL
          AND c2.academic_year = ?
      ) total
      ${whereSql}
      GROUP BY sp.id, sp.plan_name, total.totalRevenue
      ORDER BY revenue DESC
      `,
      [academicYear, ...params],
    );

    const summary = summaryRows[0];

    const totalRevenue = Number(summary?.totalRevenue || 0);
    const totalCollected = Number(summary?.totalCollected || 0);
    const totalRemaining = Number(summary?.totalRemaining || 0);

    return {
      filters: {
        academicYear,
        planId: query.planId ?? null,
      },
      summary: {
        totalRevenue: this.round2(totalRevenue),
        totalCollected: this.round2(totalCollected),
        totalRemaining: this.round2(totalRemaining),
        collectionPercentage:
          totalRevenue > 0
            ? this.round2((totalCollected / totalRevenue) * 100)
            : 0,
      },
      revenueOverview: monthRows.map((row) => ({
        monthNo: Number(row.monthNo),
        month: row.month,
        contractValue: this.round2(Number(row.contractValue || 0)),
        collected: this.round2(Number(row.collected || 0)),
      })),
      revenueByPlan: planRows.map((row) => ({
        planId: row.planId ? Number(row.planId) : null,
        planName: row.planName,
        revenue: this.round2(Number(row.revenue || 0)),
        percentage: this.round2(Number(row.percentage || 0)),
      })),
    };
  }

  async exportFinancialReport(query: ExportFinancialReportQueryDto) {
    let reportData: unknown;

    switch (query.reportType) {
      case FinancialReportType.COLLECTION_SUMMARY:
        reportData = await this.collectionSummary({
          academicYear: query.academicYear,
          fromDate: query.fromDate,
          toDate: query.toDate,
          planId: query.planId,
        });
        break;

      case FinancialReportType.DISCOUNT_TAX:
        reportData = await this.discountTaxReport({
          fromDate: query.fromDate,
          toDate: query.toDate,
          planId: query.planId,
          page: 1,
          limit: 1000,
        });
        break;

      case FinancialReportType.ADMINISTRATIVE_FEES:
        reportData = await this.administrativeFeesReport({
          fromDate: query.fromDate,
          toDate: query.toDate,
          planId: query.planId,
          page: 1,
          limit: 1000,
        });
        break;

      case FinancialReportType.YEARLY_REVENUE:
        reportData = await this.yearlyRevenue({
          academicYear: query.academicYear,
          planId: query.planId,
        });
        break;

      default:
        reportData = await this.collectionSummary({
          academicYear: query.academicYear,
          fromDate: query.fromDate,
          toDate: query.toDate,
          planId: query.planId,
        });
        break;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Financial Report');

    worksheet.addRow(['Report Type', query.reportType]);
    worksheet.addRow(['Year', query.academicYear ?? 'All']);
    worksheet.addRow(['From Date', query.fromDate ?? '']);
    worksheet.addRow(['To Date', query.toDate ?? '']);
    worksheet.addRow(['Plan ID', query.planId ?? 'All']);
    worksheet.addRow([]);

    const dataObject = reportData as {
      summary?: Record<string, unknown>;
      data?: Array<Record<string, unknown>>;
      collectionByPlan?: Array<Record<string, unknown>>;
      revenueOverview?: Array<Record<string, unknown>>;
      revenueByPlan?: Array<Record<string, unknown>>;
    };

    if (dataObject.summary) {
      worksheet.addRow(['Summary']);
      Object.entries(dataObject.summary).forEach(([key, value]) => {
        worksheet.addRow([key, String(value)]);
      });
      worksheet.addRow([]);
    }

    const tableData =
      dataObject.data ??
      dataObject.collectionByPlan ??
      dataObject.revenueByPlan ??
      dataObject.revenueOverview ??
      [];

    if (tableData.length > 0) {
      const headers = Object.keys(tableData[0]);
      worksheet.addRow(headers);

      tableData.forEach((item) => {
        worksheet.addRow(headers.map((header) => String(item[header] ?? '')));
      });
    }

    worksheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      fileName: `${query.reportType.toLowerCase()}-${Date.now()}.xlsx`,
      buffer,
    };
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
