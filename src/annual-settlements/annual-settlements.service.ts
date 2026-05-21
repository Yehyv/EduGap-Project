import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
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
        'No active settlement found for current institute',
      );
    }

    return this.findOne(Number(rows[0].id), {
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
