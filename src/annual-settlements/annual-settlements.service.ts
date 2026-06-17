import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import PDFDocument from 'pdfkit';
import { AnnualSettlementDashboardQueryDto } from 'src/billing-reports/dto/annual-settlement-dashboard-query.dto';

interface SettlementFilters {
  requesterRole?: string;
  requesterInstituteId?: number;
  selectedInstituteId?: number;
  academicYear?: number;
}

interface SettlementListRaw {
  contractId: number | string;
  instituteId: number | string;
  academicYear: number | string;
  planId: number | string;
  planName: string | null;
  maxStudentsAllowed: number | string;
  totalAmount: number | string;
  paymentPercentage: number | string;
  contractStatus: string;
  addedStudents: number | string;
  totalPaid: number | string;
  overdueInstallments: number | string;
}

interface SettlementDetailsRaw extends SettlementListRaw {
  contractNo: string;
  instituteName: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  pricePerStudent: number | string;
  packageAmount: number | string;
  discountAmount: number | string;
  amountAfterDiscount: number | string;
  administrativeFees: number | string;
  taxAmount: number | string;
}

interface InstallmentRaw {
  id: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  status: string;
}

interface PaymentRaw {
  id: number | string;
  installmentId: number | string | null;
  paymentDate: string;
  paidAmount: number | string;
  paymentMethod: string;
  receiptNo: string | null;
  status: string;
  createdAt: string;
}

interface DashboardSummaryRaw {
  totalContracts: number | string;
  totalContractValue: number | string;
  totalCollected: number | string;
  totalRemaining: number | string;
}

interface DashboardStatusRaw {
  settlementStatus: string;
  count: number | string;
}

interface TopOverdueRaw {
  contractId: number | string;
  instituteId: number | string;
  instituteName: string | null;
  overdueAmount: number | string;
  overdueInstallments: number | string;
  oldestDueDate: string | null;
}

interface InstituteDashboardRaw {
  contractId: number | string;
  contractNo: string;
  instituteId: number | string;
  instituteName: string | null;
  academicYear: number | string;
  contractStatus: string;
  contractStartDate: string | null;
  contractEndDate: string | null;
  planId: number | string;
  planName: string | null;
  planDescription: string | null;
  maxStudentsAllowed: number | string;
  pricePerStudent: number | string;
  installmentsCount: number | string;
  packageAmount: number | string;
  discountAmount: number | string;
  administrativeFees: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  paymentPercentage: number | string;
  addedStudents: number | string;
  totalPaid: number | string;
}

interface NextInstallmentRaw {
  installmentId: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  status: string;
}

interface InstitutePlanDetailsRaw {
  contractId: number | string;
  contractNo: string;
  instituteId: number | string;
  academicYear: number | string;
  contractStatus: string;
  planId: number | string;
  planName: string | null;
  planDescription: string | null;
  maxStudentsAllowed: number | string;
  pricePerStudent: number | string;
  installmentsCount: number | string;
  packageAmount: number | string;
  discountAmount: number | string;
  administrativeFees: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
}

type QueryParam = string | number;

interface InstituteQueryOptions {
  academicYear?: number;
  page?: number;
  limit?: number;
}

interface InstitutePaymentsQueryOptions extends InstituteQueryOptions {
  fromDate?: string;
  toDate?: string;
  status?: string;
}

interface PaginationResult {
  page: number;
  limit: number;
  offset: number;
}

interface InstituteInstallmentRow {
  installmentId: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  status: string;
}

interface InstituteInstallmentsSummaryRaw {
  totalInstallments: number | string;
  paidInstallments: number | string;
  remainingInstallments: number | string;
  totalAmount: number | string;
}

interface InstitutePaymentRow {
  paymentId: number | string;
  installmentId: number | string | null;
  installmentNo: number | string | null;
  paymentDate: string;
  paidAmount: number | string;
  paymentMethod: string;
  receiptNo: string | null;
  status: string;
  createdAt: string;
}

interface InstitutePaymentsSummaryRaw {
  totalPayments: number | string;
  totalPaid: number | string;
}

interface InstituteContractRemainingRaw {
  totalAmount: number | string;
  totalPaid: number | string;
  remainingAmount: number | string;
}

interface InstituteSettlementSummaryRaw {
  contractId: number | string;
  contractNo: string;
  instituteId: number | string;
  instituteName: string | null;
  academicYear: number | string;
  contractStatus: string;
  maxStudentsAllowed: number | string;
  totalAmount: number | string;
  paymentPercentage: number | string;
  addedStudents: number | string;
  totalPaid: number | string;
}

interface InstituteOverdueSummaryRaw {
  overdueAmount: number | string;
}

interface InstituteInvoiceRaw {
  installmentId: number | string;
  installmentNo: number | string;
  dueDate: string;
  installmentAmount: number | string;
  paidAmount: number | string;
  remainingAmount: number | string;
  installmentStatus: string;
  contractId: number | string;
  contractNo: string;
  instituteId: number | string;
  instituteName: string | null;
  academicYear: number | string;
  contractStartDate: string | null;
  contractStatus: string;
}

@Injectable()
export class AnnualSettlementsService {
  constructor(private readonly dataSource: DataSource) {}

  private round2(value: number): number {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  private getPagination(pageRaw?: number, limitRaw?: number): PaginationResult {
    const page = Math.max(Number(pageRaw || 1), 1);
    const limit = Math.min(Math.max(Number(limitRaw || 10), 1), 100);

    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
  }

  private getInstallmentLabel(installmentNo: number): string {
    const suffix =
      installmentNo === 1
        ? 'st'
        : installmentNo === 2
          ? 'nd'
          : installmentNo === 3
            ? 'rd'
            : 'th';

    return `${installmentNo}${suffix} Installment`;
  }

  private todayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private clampPercentage(value: number): number {
    return Math.min(Math.max(this.round2(value), 0), 100);
  }

  private isInstituteAdminRole(role?: string): boolean {
    return ['INST_ADMIN', 'INSTITUTE_ADMIN'].includes(
      String(role || '')
        .trim()
        .toUpperCase(),
    );
  }

  private resolveSettlementStatus(params: {
    contractStatus: string;
    totalAmount: number;
    totalPaid: number;
    overdueInstallments: number;
  }): string {
    const { contractStatus, totalAmount, totalPaid, overdueInstallments } =
      params;

    if (contractStatus === 'CLOSED') return 'CLOSED';
    if (totalAmount > 0 && totalPaid >= totalAmount) return 'FULLY_PAID';
    if (overdueInstallments > 0) return 'OVERDUE';
    if (totalPaid > 0) return 'PARTIALLY_PAID';

    return 'PENDING';
  }

  private getPlanLabel(planName?: string | null): string {
    const normalized = String(planName || '').toLowerCase();

    if (normalized.includes('growth')) return 'Popular';
    if (normalized.includes('enterprise')) return 'Enterprise';
    if (normalized.includes('starter')) return 'Basic';

    return 'Current';
  }

  private buildPlanFeatures(params: {
    planName?: string | null;
    maxStudents: number;
    installmentsCount: number;
  }): string[] {
    const { maxStudents, installmentsCount } = params;

    return [
      `Add up to ${maxStudents.toLocaleString()} students`,
      'Access to all learning features',
      'Unlimited courses and learning paths',
      'Priority support',
      `${installmentsCount} installment payment schedule`,
    ];
  }

  private async getActiveInstituteContractId(
    instituteId: number,
    academicYear?: number,
  ): Promise<number> {
    const year = academicYear ?? new Date().getFullYear();

    const rows = await this.dataSource.query<Array<{ id: number | string }>>(
      `
      SELECT id
      FROM institute_annual_contracts
      WHERE institute_id = ?
        AND academic_year = ?
        AND status = 'ACTIVE'
        AND deleted_at IS NULL
      ORDER BY id DESC
      LIMIT 1
      `,
      [instituteId, year],
    );

    if (!rows.length) {
      throw new NotFoundException(
        'No active annual contract found for current institute',
      );
    }

    return Number(rows[0].id);
  }

  async dashboard(query: AnnualSettlementDashboardQueryDto) {
    const academicYear = query.academicYear ?? new Date().getFullYear();

    const summaryRows = await this.dataSource.query<DashboardSummaryRaw[]>(
      `
      SELECT
        COUNT(c.id) AS totalContracts,
        COALESCE(SUM(c.total_amount), 0) AS totalContractValue,
        COALESCE(SUM(payments.totalPaid), 0) AS totalCollected,
        COALESCE(SUM(GREATEST(c.total_amount - COALESCE(payments.totalPaid, 0), 0)), 0) AS totalRemaining
      FROM institute_annual_contracts c
      LEFT JOIN (
        SELECT contract_id, SUM(paid_amount) AS totalPaid
        FROM contract_payments
        WHERE status = 'CONFIRMED'
        GROUP BY contract_id
      ) payments ON payments.contract_id = c.id
      WHERE c.deleted_at IS NULL
        AND c.academic_year = ?
      `,
      [academicYear],
    );

    const summaryRow = summaryRows[0];

    const totalContracts = Number(summaryRow?.totalContracts || 0);
    const totalContractValue = Number(summaryRow?.totalContractValue || 0);
    const totalCollected = Number(summaryRow?.totalCollected || 0);
    const totalRemaining = Number(summaryRow?.totalRemaining || 0);

    const statusRows = await this.dataSource.query<DashboardStatusRaw[]>(
      `
      SELECT settlementStatus, COUNT(*) AS count
      FROM (
        SELECT
          c.id,
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
        WHERE c.deleted_at IS NULL
          AND c.academic_year = ?
      ) x
      GROUP BY settlementStatus
      `,
      [academicYear],
    );

    const getStatusCount = (status: string): number =>
      Number(
        statusRows.find((row) => row.settlementStatus === status)?.count || 0,
      );

    const fullyPaid = getStatusCount('FULLY_PAID');
    const partiallyPaid = getStatusCount('PARTIALLY_PAID');
    const overdue = getStatusCount('OVERDUE');
    const pending = getStatusCount('PENDING');
    const closed = getStatusCount('CLOSED');

    const percentage = (count: number): number =>
      totalContracts > 0 ? this.round2((count / totalContracts) * 100) : 0;

    const topOverdueRows = await this.dataSource.query<TopOverdueRaw[]>(
      `
      SELECT
        c.id AS contractId,
        i.id AS instituteId,
        i.email AS instituteName,
        COALESCE(SUM(ci.remaining_amount), 0) AS overdueAmount,
        COUNT(ci.id) AS overdueInstallments,
        MIN(ci.due_date) AS oldestDueDate
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      INNER JOIN contract_installments ci ON ci.contract_id = c.id
      WHERE c.deleted_at IS NULL
        AND c.academic_year = ?
        AND ci.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
        AND ci.remaining_amount > 0
        AND ci.due_date < CURDATE()
      GROUP BY c.id, i.id, i.email
      ORDER BY overdueAmount DESC
      LIMIT 5
      `,
      [academicYear],
    );

    return {
      academicYear,
      summary: {
        totalContracts,
        totalContractValue: this.round2(totalContractValue),
        totalCollected: this.round2(totalCollected),
        totalRemaining: this.round2(totalRemaining),
        collectedPercentage:
          totalContractValue > 0
            ? this.round2((totalCollected / totalContractValue) * 100)
            : 0,
        remainingPercentage:
          totalContractValue > 0
            ? this.round2((totalRemaining / totalContractValue) * 100)
            : 0,
      },
      overview: {
        fullyPaid: {
          count: fullyPaid,
          percentage: percentage(fullyPaid),
        },
        partiallyPaid: {
          count: partiallyPaid,
          percentage: percentage(partiallyPaid),
        },
        overdue: {
          count: overdue,
          percentage: percentage(overdue),
        },
        pending: {
          count: pending,
          percentage: percentage(pending),
        },
        closed: {
          count: closed,
          percentage: percentage(closed),
        },
      },
      settlementByStatus: [
        {
          status: 'FULLY_PAID',
          label: 'Fully Paid',
          count: fullyPaid,
          percentage: percentage(fullyPaid),
        },
        {
          status: 'PARTIALLY_PAID',
          label: 'Partially Paid',
          count: partiallyPaid,
          percentage: percentage(partiallyPaid),
        },
        {
          status: 'OVERDUE',
          label: 'Overdue',
          count: overdue,
          percentage: percentage(overdue),
        },
        {
          status: 'PENDING',
          label: 'Pending',
          count: pending,
          percentage: percentage(pending),
        },
        {
          status: 'CLOSED',
          label: 'Closed',
          count: closed,
          percentage: percentage(closed),
        },
      ],
      topOverdueInstitutions: topOverdueRows.map((row) => ({
        contractId: Number(row.contractId),
        instituteId: Number(row.instituteId),
        instituteName: row.instituteName,
        overdueAmount: this.round2(Number(row.overdueAmount || 0)),
        overdueInstallments: Number(row.overdueInstallments || 0),
        oldestDueDate: row.oldestDueDate,
      })),
    };
  }

  async instituteDashboard(instituteId: number, academicYear?: number) {
    const contractId = await this.getActiveInstituteContractId(
      instituteId,
      academicYear,
    );

    const rows = await this.dataSource.query<InstituteDashboardRaw[]>(
      `
      SELECT
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        i.id AS instituteId,
        i.email AS instituteName,
        c.academic_year AS academicYear,
        c.status AS contractStatus,
        c.contract_start_date AS contractStartDate,
        c.contract_end_date AS contractEndDate,
        sp.id AS planId,
        sp.plan_name AS planName,
        sp.description AS planDescription,
        c.max_students_allowed AS maxStudentsAllowed,
        c.price_per_student AS pricePerStudent,
        c.installments_count AS installmentsCount,
        c.package_amount AS packageAmount,
        c.discount_amount AS discountAmount,
        c.administrative_fees AS administrativeFees,
        c.tax_amount AS taxAmount,
        c.total_amount AS totalAmount,
        c.payment_percentage AS paymentPercentage,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(MAX(payments.totalPaid), 0) AS totalPaid
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      LEFT JOIN \`user\` u
        ON u.annual_contract_id = c.id
        AND u.deletedAt IS NULL
        AND u.is_active = 1
      LEFT JOIN (
        SELECT contract_id, SUM(paid_amount) AS totalPaid
        FROM contract_payments
        WHERE status = 'CONFIRMED'
        GROUP BY contract_id
      ) payments ON payments.contract_id = c.id
      WHERE c.id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
      GROUP BY c.id, i.id, sp.id
      LIMIT 1
      `,
      [contractId, instituteId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException(
        'No active annual contract found for current institute',
      );
    }

    const nextRows = await this.dataSource.query<NextInstallmentRaw[]>(
      `
      SELECT
        id AS installmentId,
        installment_no AS installmentNo,
        due_date AS dueDate,
        installment_amount AS installmentAmount,
        paid_amount AS paidAmount,
        remaining_amount AS remainingAmount,
        status
      FROM contract_installments
      WHERE contract_id = ?
        AND status IN ('PENDING', 'PARTIAL', 'OVERDUE')
        AND remaining_amount > 0
      ORDER BY due_date ASC, installment_no ASC
      LIMIT 1
      `,
      [contractId],
    );

    const nextInstallment = nextRows[0] ?? null;

    const maxStudents = Number(row.maxStudentsAllowed || 0);
    const addedStudents = Number(row.addedStudents || 0);
    const remainingStudents = Math.max(maxStudents - addedStudents, 0);
    const totalAmount = Number(row.totalAmount || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const remainingAmount = Math.max(totalAmount - totalPaid, 0);
    const usedPercentage =
      maxStudents > 0 ? this.round2((addedStudents / maxStudents) * 100) : 0;
    const remainingPercentage =
      maxStudents > 0
        ? this.round2((remainingStudents / maxStudents) * 100)
        : 0;

    return {
      currentPlan: {
        planId: Number(row.planId),
        planName: row.planName,
        label: this.getPlanLabel(row.planName),
        description: row.planDescription,
      },
      students: {
        maxStudents,
        addedStudents,
        remainingStudents,
        usedPercentage,
        remainingPercentage,
      },
      contract: {
        contractId: Number(row.contractId),
        contractNo: row.contractNo,
        instituteId: Number(row.instituteId),
        instituteName: row.instituteName,
        academicYear: Number(row.academicYear),
        startDate: row.contractStartDate,
        endDate: row.contractEndDate,
        status: row.contractStatus,
      },
      financial: {
        contractValue: this.round2(totalAmount),
        totalPaid: this.round2(totalPaid),
        remainingAmount: this.round2(remainingAmount),
        paymentPercentage: Number(row.paymentPercentage || 0),
        totalInstallments: Number(row.installmentsCount || 0),
      },
      nextInstallment: nextInstallment
        ? {
            installmentId: Number(nextInstallment.installmentId),
            installmentNo: Number(nextInstallment.installmentNo),
            dueDate: nextInstallment.dueDate,
            amount: this.round2(Number(nextInstallment.remainingAmount || 0)),
            installmentAmount: this.round2(
              Number(nextInstallment.installmentAmount || 0),
            ),
            paidAmount: this.round2(Number(nextInstallment.paidAmount || 0)),
            remainingAmount: this.round2(
              Number(nextInstallment.remainingAmount || 0),
            ),
            status: nextInstallment.status,
          }
        : null,
    };
  }

  async instituteInstallments(
    instituteId: number,
    options: InstituteQueryOptions = {},
  ) {
    const contractId = await this.getActiveInstituteContractId(
      instituteId,
      options.academicYear,
    );

    const pagination = this.getPagination(options.page, options.limit);

    const summaryRows = await this.dataSource.query<
      InstituteInstallmentsSummaryRaw[]
    >(
      `
        SELECT
          COUNT(ci.id) AS totalInstallments,
          COALESCE(SUM(CASE WHEN ci.status = 'PAID' THEN 1 ELSE 0 END), 0) AS paidInstallments,
          COALESCE(SUM(CASE WHEN ci.status <> 'PAID' THEN 1 ELSE 0 END), 0) AS remainingInstallments,
          COALESCE(SUM(ci.installment_amount), 0) AS totalAmount
        FROM contract_installments ci
        INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
        WHERE ci.contract_id = ?
          AND c.institute_id = ?
          AND c.deleted_at IS NULL
        `,
      [contractId, instituteId],
    );

    const totalRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(
      `
      SELECT COUNT(ci.id) AS total
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      WHERE ci.contract_id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
      `,
      [contractId, instituteId],
    );

    const rows = await this.dataSource.query<InstituteInstallmentRow[]>(
      `
      SELECT
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount,
        ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      WHERE ci.contract_id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
      ORDER BY ci.installment_no ASC
      LIMIT ? OFFSET ?
      `,
      [contractId, instituteId, pagination.limit, pagination.offset],
    );

    const nextRows = await this.dataSource.query<NextInstallmentRaw[]>(
      `
      SELECT
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount,
        ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      WHERE ci.contract_id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
        AND ci.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
        AND ci.remaining_amount > 0
      ORDER BY ci.due_date ASC, ci.installment_no ASC
      LIMIT 1
      `,
      [contractId, instituteId],
    );

    const summary = summaryRows[0];
    const total = Number(totalRows[0]?.total || 0);
    const nextInstallment = nextRows[0] ?? null;

    return {
      summary: {
        totalInstallments: Number(summary?.totalInstallments || 0),
        paidInstallments: Number(summary?.paidInstallments || 0),
        remainingInstallments: Number(summary?.remainingInstallments || 0),
        totalAmount: this.round2(Number(summary?.totalAmount || 0)),
      },
      data: rows.map((row) => {
        const installmentNo = Number(row.installmentNo);

        return {
          installmentId: Number(row.installmentId),
          installmentNo,
          label: this.getInstallmentLabel(installmentNo),
          dueDate: row.dueDate,
          installmentAmount: this.round2(Number(row.installmentAmount || 0)),
          paidAmount: this.round2(Number(row.paidAmount || 0)),
          remainingAmount: this.round2(Number(row.remainingAmount || 0)),
          status: row.status,
        };
      }),
      nextInstallment: nextInstallment
        ? {
            installmentId: Number(nextInstallment.installmentId),
            installmentNo: Number(nextInstallment.installmentNo),
            label: this.getInstallmentLabel(
              Number(nextInstallment.installmentNo),
            ),
            dueDate: nextInstallment.dueDate,
            amount: this.round2(Number(nextInstallment.remainingAmount || 0)),
            installmentAmount: this.round2(
              Number(nextInstallment.installmentAmount || 0),
            ),
            paidAmount: this.round2(Number(nextInstallment.paidAmount || 0)),
            remainingAmount: this.round2(
              Number(nextInstallment.remainingAmount || 0),
            ),
            status: nextInstallment.status,
          }
        : null,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
        count: rows.length,
      },
    };
  }

  async institutePayments(
    instituteId: number,
    options: InstitutePaymentsQueryOptions = {},
  ) {
    const contractId = await this.getActiveInstituteContractId(
      instituteId,
      options.academicYear,
    );

    const pagination = this.getPagination(options.page, options.limit);

    const conditions: string[] = [
      'p.contract_id = ?',
      'c.institute_id = ?',
      'c.deleted_at IS NULL',
    ];

    const params: QueryParam[] = [contractId, instituteId];

    if (options.fromDate?.trim()) {
      conditions.push('p.payment_date >= ?');
      params.push(options.fromDate.trim());
    }

    if (options.toDate?.trim()) {
      conditions.push('p.payment_date <= ?');
      params.push(options.toDate.trim());
    }

    if (options.status?.trim()) {
      conditions.push('p.status = ?');
      params.push(options.status.trim());
    }

    const whereSql = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows = await this.dataSource.query<
      InstitutePaymentsSummaryRaw[]
    >(
      `
        SELECT
          COUNT(p.id) AS totalPayments,
          COALESCE(SUM(CASE WHEN p.status = 'CONFIRMED' THEN p.paid_amount ELSE 0 END), 0) AS totalPaid
        FROM contract_payments p
        INNER JOIN institute_annual_contracts c ON c.id = p.contract_id
        ${whereSql}
        `,
      params,
    );

    const remainingRows = await this.dataSource.query<
      InstituteContractRemainingRaw[]
    >(
      `
        SELECT
          c.total_amount AS totalAmount,
          COALESCE(payments.totalPaid, 0) AS totalPaid,
          GREATEST(c.total_amount - COALESCE(payments.totalPaid, 0), 0) AS remainingAmount
        FROM institute_annual_contracts c
        LEFT JOIN (
          SELECT contract_id, SUM(paid_amount) AS totalPaid
          FROM contract_payments
          WHERE status = 'CONFIRMED'
          GROUP BY contract_id
        ) payments ON payments.contract_id = c.id
        WHERE c.id = ?
          AND c.institute_id = ?
          AND c.deleted_at IS NULL
        LIMIT 1
        `,
      [contractId, instituteId],
    );

    const totalRows = await this.dataSource.query<
      Array<{ total: number | string }>
    >(
      `
      SELECT COUNT(p.id) AS total
      FROM contract_payments p
      INNER JOIN institute_annual_contracts c ON c.id = p.contract_id
      ${whereSql}
      `,
      params,
    );

    const rows = await this.dataSource.query<InstitutePaymentRow[]>(
      `
      SELECT
        p.id AS paymentId,
        p.installment_id AS installmentId,
        ci.installment_no AS installmentNo,
        p.payment_date AS paymentDate,
        p.paid_amount AS paidAmount,
        p.payment_method AS paymentMethod,
        p.receipt_no AS receiptNo,
        p.status,
        p.created_at AS createdAt
      FROM contract_payments p
      INNER JOIN institute_annual_contracts c ON c.id = p.contract_id
      LEFT JOIN contract_installments ci ON ci.id = p.installment_id
      ${whereSql}
      ORDER BY p.payment_date DESC, p.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, pagination.limit, pagination.offset],
    );

    const summary = summaryRows[0];
    const remaining = remainingRows[0];
    const total = Number(totalRows[0]?.total || 0);

    return {
      filters: {
        academicYear: options.academicYear ?? null,
        fromDate: options.fromDate ?? null,
        toDate: options.toDate ?? null,
        status: options.status ?? null,
      },
      summary: {
        totalPayments: Number(summary?.totalPayments || 0),
        totalPaid: this.round2(Number(summary?.totalPaid || 0)),
        remainingAmount: this.round2(Number(remaining?.remainingAmount || 0)),
      },
      data: rows.map((row) => {
        const installmentNo = row.installmentNo
          ? Number(row.installmentNo)
          : null;

        return {
          paymentId: Number(row.paymentId),
          paymentNo: `PAY-${new Date(row.paymentDate).getFullYear()}-${String(
            row.paymentId,
          ).padStart(3, '0')}`,
          installmentId: row.installmentId ? Number(row.installmentId) : null,
          installmentNo,
          installmentLabel: installmentNo
            ? this.getInstallmentLabel(installmentNo)
            : null,
          paymentDate: row.paymentDate,
          amount: this.round2(Number(row.paidAmount || 0)),
          paymentMethod: row.paymentMethod,
          method: row.paymentMethod,
          receiptNo: row.receiptNo,
          status: row.status,
          createdAt: row.createdAt,
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

  async instituteNextInstallment(instituteId: number, academicYear?: number) {
    const contractId = await this.getActiveInstituteContractId(
      instituteId,
      academicYear,
    );

    const rows = await this.dataSource.query<NextInstallmentRaw[]>(
      `
      SELECT
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount,
        ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount,
        ci.status
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      WHERE ci.contract_id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
        AND ci.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
        AND ci.remaining_amount > 0
      ORDER BY ci.due_date ASC, ci.installment_no ASC
      LIMIT 1
      `,
      [contractId, instituteId],
    );

    const nextInstallment = rows[0];

    if (!nextInstallment) {
      return {
        hasNextInstallment: false,
        nextInstallment: null,
        progress: null,
        actions: {
          payNow: false,
          viewInstallments: true,
        },
      };
    }

    const today = this.todayDate();

    const daysRows = await this.dataSource.query<
      Array<{ daysLeft: number | string }>
    >(
      `
      SELECT DATEDIFF(?, ?) AS daysLeft
      `,
      [nextInstallment.dueDate, today],
    );

    const daysLeft = Number(daysRows[0]?.daysLeft || 0);
    const progressPercentage = this.clampPercentage(
      ((90 - daysLeft) / 90) * 100,
    );
    const installmentNo = Number(nextInstallment.installmentNo);

    return {
      hasNextInstallment: true,
      nextInstallment: {
        installmentId: Number(nextInstallment.installmentId),
        installmentNo,
        label: this.getInstallmentLabel(installmentNo),
        dueDate: nextInstallment.dueDate,
        amount: this.round2(Number(nextInstallment.remainingAmount || 0)),
        installmentAmount: this.round2(
          Number(nextInstallment.installmentAmount || 0),
        ),
        paidAmount: this.round2(Number(nextInstallment.paidAmount || 0)),
        remainingAmount: this.round2(
          Number(nextInstallment.remainingAmount || 0),
        ),
        daysLeft,
        status: nextInstallment.status,
      },
      progress: {
        daysLeft,
        progressPercentage,
      },
      actions: {
        payNow: true,
        viewInstallments: true,
      },
    };
  }

  async instituteSettlementSummary(instituteId: number, academicYear?: number) {
    const contractId = await this.getActiveInstituteContractId(
      instituteId,
      academicYear,
    );

    const rows = await this.dataSource.query<InstituteSettlementSummaryRaw[]>(
      `
      SELECT
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        i.id AS instituteId,
        i.email AS instituteName,
        c.academic_year AS academicYear,
        c.status AS contractStatus,
        c.max_students_allowed AS maxStudentsAllowed,
        c.total_amount AS totalAmount,
        c.payment_percentage AS paymentPercentage,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(MAX(payments.totalPaid), 0) AS totalPaid
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      LEFT JOIN \`user\` u
        ON u.annual_contract_id = c.id
        AND u.deletedAt IS NULL
        AND u.is_active = 1
      LEFT JOIN (
        SELECT contract_id, SUM(paid_amount) AS totalPaid
        FROM contract_payments
        WHERE status = 'CONFIRMED'
        GROUP BY contract_id
      ) payments ON payments.contract_id = c.id
      WHERE c.id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
      GROUP BY c.id, i.id
      LIMIT 1
      `,
      [contractId, instituteId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException(
        'No active settlement summary found for current institute',
      );
    }

    const overdueRows = await this.dataSource.query<
      InstituteOverdueSummaryRaw[]
    >(
      `
      SELECT
        COALESCE(SUM(ci.remaining_amount), 0) AS overdueAmount
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      WHERE ci.contract_id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
        AND ci.status IN ('PENDING', 'PARTIAL', 'OVERDUE')
        AND ci.remaining_amount > 0
        AND ci.due_date < CURDATE()
      `,
      [contractId, instituteId],
    );

    const contractValue = Number(row.totalAmount || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const remainingAmount = Math.max(contractValue - totalPaid, 0);
    const overdueAmount = Number(overdueRows[0]?.overdueAmount || 0);
    const pendingAmount = Math.max(remainingAmount - overdueAmount, 0);

    const maxStudents = Number(row.maxStudentsAllowed || 0);
    const addedStudents = Number(row.addedStudents || 0);
    const remainingStudents = Math.max(maxStudents - addedStudents, 0);

    const collectionPercentage =
      contractValue > 0 ? this.round2((totalPaid / contractValue) * 100) : 0;

    const usagePercentage =
      maxStudents > 0 ? this.round2((addedStudents / maxStudents) * 100) : 0;

    const amountPercentage = (amount: number): number =>
      contractValue > 0 ? this.round2((amount / contractValue) * 100) : 0;

    return {
      financial: {
        contractValue: this.round2(contractValue),
        totalPaid: this.round2(totalPaid),
        remainingAmount: this.round2(remainingAmount),
        collectionPercentage,
      },
      paymentStatus: {
        paid: {
          amount: this.round2(totalPaid),
          percentage: amountPercentage(totalPaid),
        },
        pending: {
          amount: this.round2(pendingAmount),
          percentage: amountPercentage(pendingAmount),
        },
        overdue: {
          amount: this.round2(overdueAmount),
          percentage: amountPercentage(overdueAmount),
        },
      },
      students: {
        maxStudents,
        addedStudents,
        remainingStudents,
        usagePercentage,
      },
      contract: {
        contractId: Number(row.contractId),
        contractNo: row.contractNo,
        instituteId: Number(row.instituteId),
        instituteName: row.instituteName,
        academicYear: Number(row.academicYear),
        status: row.contractStatus,
      },
    };
  }

  async instituteInvoice(instituteId: number, installmentId: number) {
    const rows = await this.dataSource.query<InstituteInvoiceRaw[]>(
      `
      SELECT
        ci.id AS installmentId,
        ci.installment_no AS installmentNo,
        ci.due_date AS dueDate,
        ci.installment_amount AS installmentAmount,
        ci.paid_amount AS paidAmount,
        ci.remaining_amount AS remainingAmount,
        ci.status AS installmentStatus,
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        i.id AS instituteId,
        i.email AS instituteName,
        c.academic_year AS academicYear,
        c.contract_start_date AS contractStartDate,
        c.status AS contractStatus
      FROM contract_installments ci
      INNER JOIN institute_annual_contracts c ON c.id = ci.contract_id
      INNER JOIN institute i ON i.id = c.institute_id
      WHERE ci.id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
      LIMIT 1
      `,
      [installmentId, instituteId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException('Invoice installment not found');
    }

    const installmentNo = Number(row.installmentNo);
    const amount = Number(row.installmentAmount || 0);
    const academicYear = Number(row.academicYear);

    return {
      invoice: {
        invoiceNo: `INV-${academicYear}-${String(row.installmentId).padStart(
          3,
          '0',
        )}`,
        contractNo: row.contractNo,
        contractId: Number(row.contractId),
        installmentId: Number(row.installmentId),
        installmentNo,
        invoiceDate: row.contractStartDate ?? row.dueDate,
        dueDate: row.dueDate,
        status: row.installmentStatus,
        amount: this.round2(amount),
        paidAmount: this.round2(Number(row.paidAmount || 0)),
        remainingAmount: this.round2(Number(row.remainingAmount || 0)),
      },
      billTo: {
        instituteId: Number(row.instituteId),
        instituteName: row.instituteName,
      },
      items: [
        {
          description: this.getInstallmentLabel(installmentNo),
          amount: this.round2(amount),
        },
      ],
      total: this.round2(amount),
    };
  }

  async downloadInstituteInvoice(instituteId: number, installmentId: number) {
    const invoice = await this.instituteInvoice(instituteId, installmentId);

    return {
      fileName: `${invoice.invoice.invoiceNo}.pdf`,
      buffer: await this.buildInvoicePdfBuffer(invoice),
    };
  }

  private buildInvoicePdfBuffer(
    invoice: Awaited<ReturnType<typeof this.instituteInvoice>>,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Invoice', { align: 'center' });
      doc.moveDown();

      doc
        .fontSize(10)
        .text(`Invoice No: ${invoice.invoice.invoiceNo}`)
        .text(`Contract No: ${invoice.invoice.contractNo}`)
        .text(`Invoice Date: ${this.formatPdfDate(invoice.invoice.invoiceDate)}`)
        .text(`Due Date: ${this.formatPdfDate(invoice.invoice.dueDate)}`)
        .text(`Status: ${invoice.invoice.status}`);

      doc.moveDown();
      doc.fontSize(12).text('Bill To', { underline: true });
      doc
        .fontSize(10)
        .text(`Institute: ${invoice.billTo.instituteName}`)
        .text(`Institute ID: ${invoice.billTo.instituteId}`);

      doc.moveDown();
      doc.fontSize(12).text('Items', { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc
        .fontSize(10)
        .text('Description', 50, tableTop)
        .text('Amount', 450, tableTop, { width: 100, align: 'right' });
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      for (const item of invoice.items) {
        const rowY = doc.y;
        doc
          .text(item.description, 50, rowY)
          .text(item.amount.toFixed(2), 450, rowY, {
            width: 100,
            align: 'right',
          });
        doc.moveDown(0.5);
      }

      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      doc
        .fontSize(12)
        .text(`Total: ${invoice.total.toFixed(2)}`, { align: 'right' });
      doc
        .fontSize(10)
        .text(`Paid: ${invoice.invoice.paidAmount.toFixed(2)}`, {
          align: 'right',
        })
        .text(`Remaining: ${invoice.invoice.remainingAmount.toFixed(2)}`, {
          align: 'right',
        });

      doc.end();
    });
  }

  private formatPdfDate(value: string | null | undefined): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toISOString().slice(0, 10);
  }

  async institutePlanDetails(instituteId: number, academicYear?: number) {
    const contractId = await this.getActiveInstituteContractId(
      instituteId,
      academicYear,
    );

    const rows = await this.dataSource.query<InstitutePlanDetailsRaw[]>(
      `
      SELECT
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        i.id AS instituteId,
        c.academic_year AS academicYear,
        c.status AS contractStatus,
        sp.id AS planId,
        sp.plan_name AS planName,
        sp.description AS planDescription,
        c.max_students_allowed AS maxStudentsAllowed,
        c.price_per_student AS pricePerStudent,
        c.installments_count AS installmentsCount,
        c.package_amount AS packageAmount,
        c.discount_amount AS discountAmount,
        c.administrative_fees AS administrativeFees,
        c.tax_amount AS taxAmount,
        c.total_amount AS totalAmount
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      WHERE c.id = ?
        AND c.institute_id = ?
        AND c.deleted_at IS NULL
      LIMIT 1
      `,
      [contractId, instituteId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException(
        'No active plan details found for current institute',
      );
    }

    const maxStudents = Number(row.maxStudentsAllowed || 0);
    const installmentsCount = Number(row.installmentsCount || 0);

    return {
      plan: {
        planId: Number(row.planId),
        planName: row.planName,
        label: this.getPlanLabel(row.planName),
        description:
          row.planDescription ??
          'Current active billing plan for this institute.',
        features: this.buildPlanFeatures({
          planName: row.planName,
          maxStudents,
          installmentsCount,
        }),
      },
      limits: {
        maxStudents,
        pricePerStudent: this.round2(Number(row.pricePerStudent || 0)),
        installments: installmentsCount,
      },
      financial: {
        contractValue: this.round2(Number(row.packageAmount || 0)),
        discount: this.round2(Number(row.discountAmount || 0)),
        administrativeFees: this.round2(Number(row.administrativeFees || 0)),
        tax: this.round2(Number(row.taxAmount || 0)),
        totalContractValue: this.round2(Number(row.totalAmount || 0)),
      },
      contract: {
        contractId: Number(row.contractId),
        contractNo: row.contractNo,
        instituteId: Number(row.instituteId),
        academicYear: Number(row.academicYear),
        status: row.contractStatus,
      },
    };
  }

  async findAll(filters: SettlementFilters = {}) {
    const params: Array<number | string> = [];
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

    const rows = await this.dataSource.query<SettlementListRaw[]>(
      `
      SELECT
        c.id AS contractId,
        i.id AS instituteId,
        c.academic_year AS academicYear,
        sp.id AS planId,
        sp.plan_name AS planName,
        c.max_students_allowed AS maxStudentsAllowed,
        c.total_amount AS totalAmount,
        c.payment_percentage AS paymentPercentage,
        c.status AS contractStatus,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(MAX(payments.totalPaid), 0) AS totalPaid,
        COALESCE(MAX(overdue.overdueInstallments), 0) AS overdueInstallments
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      LEFT JOIN \`user\` u
        ON u.annual_contract_id = c.id
        AND u.deletedAt IS NULL
        AND u.is_active = 1
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
      ${where}
      GROUP BY c.id, i.id, sp.id
      ORDER BY c.id DESC
      `,
      params,
    );

    return {
      settlements: rows.map((row) => this.mapSettlement(row)),
    };
  }

  async findOne(
    contractId: number,
    filters: Pick<
      SettlementFilters,
      'requesterRole' | 'requesterInstituteId'
    > = {},
  ) {
    const rows = await this.dataSource.query<SettlementDetailsRaw[]>(
      `
      SELECT
        c.id AS contractId,
        CONCAT('CON-', c.academic_year, '-', LPAD(c.id, 3, '0')) AS contractNo,
        i.id AS instituteId,
        i.email AS instituteName,
        c.academic_year AS academicYear,
        sp.id AS planId,
        sp.plan_name AS planName,
        c.max_students_allowed AS maxStudentsAllowed,
        c.total_amount AS totalAmount,
        c.payment_percentage AS paymentPercentage,
        c.status AS contractStatus,
        c.contract_start_date AS contractStartDate,
        c.contract_end_date AS contractEndDate,
        c.price_per_student AS pricePerStudent,
        c.package_amount AS packageAmount,
        c.discount_amount AS discountAmount,
        c.amount_after_discount AS amountAfterDiscount,
        c.administrative_fees AS administrativeFees,
        c.tax_amount AS taxAmount,
        COUNT(DISTINCT u.id) AS addedStudents,
        COALESCE(MAX(payments.totalPaid), 0) AS totalPaid,
        COALESCE(MAX(overdue.overdueInstallments), 0) AS overdueInstallments
      FROM institute_annual_contracts c
      INNER JOIN institute i ON i.id = c.institute_id
      INNER JOIN subscription_plans sp ON sp.id = c.plan_id
      LEFT JOIN \`user\` u
        ON u.annual_contract_id = c.id
        AND u.deletedAt IS NULL
        AND u.is_active = 1
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
      WHERE c.id = ?
        AND c.deleted_at IS NULL
      GROUP BY c.id, i.id, sp.id
      LIMIT 1
      `,
      [contractId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException('Annual settlement not found');
    }

    if (
      this.isInstituteAdminRole(filters.requesterRole) &&
      Number(row.instituteId) !== Number(filters.requesterInstituteId)
    ) {
      throw new ForbiddenException(
        'You are not allowed to access this annual settlement',
      );
    }

    const installments = await this.dataSource.query<InstallmentRaw[]>(
      `
      SELECT
        id,
        installment_no AS installmentNo,
        due_date AS dueDate,
        installment_amount AS installmentAmount,
        paid_amount AS paidAmount,
        remaining_amount AS remainingAmount,
        status
      FROM contract_installments
      WHERE contract_id = ?
      ORDER BY installment_no ASC
      `,
      [contractId],
    );

    const payments = await this.dataSource.query<PaymentRaw[]>(
      `
      SELECT
        id,
        installment_id AS installmentId,
        payment_date AS paymentDate,
        paid_amount AS paidAmount,
        payment_method AS paymentMethod,
        receipt_no AS receiptNo,
        status,
        created_at AS createdAt
      FROM contract_payments
      WHERE contract_id = ?
      ORDER BY id DESC
      `,
      [contractId],
    );

    const settlement = this.mapSettlement(row);

    const totalAmount = Number(row.totalAmount || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const totalRemaining = this.round2(Math.max(totalAmount - totalPaid, 0));
    const collectionPercentage =
      totalAmount > 0 ? this.round2((totalPaid / totalAmount) * 100) : 0;

    const paidInstallments = installments.filter(
      (item) => item.status === 'PAID',
    ).length;

    const partialInstallments = installments.filter(
      (item) => item.status === 'PARTIAL',
    ).length;

    const pendingInstallments = installments.filter(
      (item) => item.status === 'PENDING',
    ).length;

    const overdueInstallments = Number(row.overdueInstallments || 0);

    const lastConfirmedPayment = payments.find(
      (payment) => payment.status === 'CONFIRMED',
    );

    return {
      ...settlement,
      contract: {
        contractId: Number(row.contractId),
        contractNo: row.contractNo,
        instituteId: Number(row.instituteId),
        instituteName: row.instituteName,
        academicYear: Number(row.academicYear),
        planId: Number(row.planId),
        planName: row.planName,
        status: row.contractStatus,
        contractStartDate: row.contractStartDate,
        contractEndDate: row.contractEndDate,
      },
      summary: {
        totalAmount: this.round2(totalAmount),
        totalPaid: this.round2(totalPaid),
        remainingAmount: totalRemaining,
        collectionPercentage,
        settlementStatus: settlement.settlementStatus,
      },
      contractSummary: {
        maxStudentsAllowed: Number(row.maxStudentsAllowed || 0),
        addedStudents: Number(row.addedStudents || 0),
        remainingStudents: settlement.remainingStudents,
        pricePerStudent: this.round2(Number(row.pricePerStudent || 0)),
        packageAmount: this.round2(Number(row.packageAmount || 0)),
        discountAmount: this.round2(Number(row.discountAmount || 0)),
        amountAfterDiscount: this.round2(Number(row.amountAfterDiscount || 0)),
        administrativeFees: this.round2(Number(row.administrativeFees || 0)),
        taxAmount: this.round2(Number(row.taxAmount || 0)),
        netAmount: this.round2(totalAmount),
      },
      paymentSummary: {
        totalInstallments: installments.length,
        paidInstallments,
        partialInstallments,
        pendingInstallments,
        overdueInstallments,
        lastPaymentDate: lastConfirmedPayment?.paymentDate ?? null,
        lastPaymentAmount: this.round2(
          Number(lastConfirmedPayment?.paidAmount || 0),
        ),
        lastPaymentMethod: lastConfirmedPayment?.paymentMethod ?? null,
      },
      collectionProgress: {
        percentage: collectionPercentage,
        collected: this.round2(totalPaid),
        remaining: totalRemaining,
      },
      installments: installments.map((item) => ({
        id: Number(item.id),
        installmentId: Number(item.id),
        installmentNo: Number(item.installmentNo),
        dueDate: item.dueDate,
        installmentAmount: this.round2(Number(item.installmentAmount || 0)),
        paidAmount: this.round2(Number(item.paidAmount || 0)),
        remainingAmount: this.round2(Number(item.remainingAmount || 0)),
        status: item.status,
      })),
      payments: payments.map((payment) => ({
        id: Number(payment.id),
        paymentId: Number(payment.id),
        installmentId: payment.installmentId
          ? Number(payment.installmentId)
          : null,
        paymentDate: payment.paymentDate,
        paidAmount: this.round2(Number(payment.paidAmount || 0)),
        paymentMethod: payment.paymentMethod,
        receiptNo: payment.receiptNo,
        status: payment.status,
        createdAt: payment.createdAt,
      })),
    };
  }

  async currentForInstitute(instituteId: number, academicYear?: number) {
    const contractId = await this.getActiveInstituteContractId(
      instituteId,
      academicYear,
    );

    return this.findOne(contractId, {
      requesterRole: 'INSTITUTE_ADMIN',
      requesterInstituteId: instituteId,
    });
  }

  private mapSettlement(row: SettlementListRaw) {
    const maxStudentsAllowed = Number(row.maxStudentsAllowed || 0);
    const addedStudents = Number(row.addedStudents || 0);
    const totalAmount = Number(row.totalAmount || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const totalRemaining = this.round2(Math.max(totalAmount - totalPaid, 0));
    const overdueInstallments = Number(row.overdueInstallments || 0);

    const settlementStatus = this.resolveSettlementStatus({
      contractStatus: row.contractStatus,
      totalAmount,
      totalPaid,
      overdueInstallments,
    });

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
