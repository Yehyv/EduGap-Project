import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AnnualSettlementsService } from './annual-settlements.service';
import { AnnualSettlementDashboardQueryDto } from 'src/billing-reports/dto/annual-settlement-dashboard-query.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    role?: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('annual-settlements')
export class AnnualSettlementsController {
  constructor(private readonly service: AnnualSettlementsService) {}

  /**
   * Screen 21
   * Annual Settlement Dashboard - Super Admin / Admin
   *
   * GET /annual-settlements/dashboard?academicYear=2025
   */
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('dashboard')
  dashboard(@Query() query: AnnualSettlementDashboardQueryDto) {
    return this.service.dashboard(query);
  }

  /**
   * Screen 31
   * Institution Billing Dashboard - Institute Admin
   *
   * GET /annual-settlements/institute/dashboard?academicYear=2025
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/dashboard')
  instituteDashboard(
    @Req() req: AuthenticatedRequest,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    return this.service.instituteDashboard(
      req.user.instituteId,
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  /**
   * Screen 34
   * Institution Installments Schedule - Institute Admin
   *
   * GET /annual-settlements/institute/installments?academicYear=2025&page=1&limit=10
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/installments')
  instituteInstallments(
    @Req() req: AuthenticatedRequest,
    @Query('academicYear') academicYearRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    return this.service.instituteInstallments(req.user.instituteId, {
      academicYear: academicYearRaw ? Number(academicYearRaw) : undefined,
      page: pageRaw ? Number(pageRaw) : undefined,
      limit: limitRaw ? Number(limitRaw) : undefined,
    });
  }

  /**
   * Screen 35
   * Institution Payments History - Institute Admin
   *
   * GET /annual-settlements/institute/payments?academicYear=2025&fromDate=2025-01-01&toDate=2025-12-31&status=CONFIRMED&page=1&limit=10
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/payments')
  institutePayments(
    @Req() req: AuthenticatedRequest,
    @Query('academicYear') academicYearRaw?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('status') status?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    return this.service.institutePayments(req.user.instituteId, {
      academicYear: academicYearRaw ? Number(academicYearRaw) : undefined,
      fromDate,
      toDate,
      status,
      page: pageRaw ? Number(pageRaw) : undefined,
      limit: limitRaw ? Number(limitRaw) : undefined,
    });
  }

  /**
   * Screen 36
   * Next Installment Alert - Institute Admin
   *
   * GET /annual-settlements/institute/next-installment?academicYear=2025
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/next-installment')
  instituteNextInstallment(
    @Req() req: AuthenticatedRequest,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    return this.service.instituteNextInstallment(
      req.user.instituteId,
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  /**
   * Screen 37
   * Institution Settlement Summary - Institute Admin
   *
   * GET /annual-settlements/institute/settlement-summary?academicYear=2025
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/settlement-summary')
  instituteSettlementSummary(
    @Req() req: AuthenticatedRequest,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    return this.service.instituteSettlementSummary(
      req.user.instituteId,
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  /**
   * Screen 38
   * Download Invoice - Institute Admin
   *
   * GET /annual-settlements/institute/invoices/:installmentId
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/invoices/:installmentId')
  instituteInvoice(
    @Req() req: AuthenticatedRequest,
    @Param('installmentId', ParseIntPipe) installmentId: number,
  ) {
    return this.service.instituteInvoice(req.user.instituteId, installmentId);
  }

  /**
   * Screen 38
   * Download Invoice Data - Institute Admin
   *
   * GET /annual-settlements/institute/invoices/:installmentId/download
   *
   * Currently returns invoice-ready JSON.
   * PDF generation can be added later.
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/invoices/:installmentId/download')
  downloadInstituteInvoice(
    @Req() req: AuthenticatedRequest,
    @Param('installmentId', ParseIntPipe) installmentId: number,
  ) {
    return this.service.downloadInstituteInvoice(
      req.user.instituteId,
      installmentId,
    );
  }

  /**
   * Screen 33
   * Institution Plan Details - Institute Admin
   *
   * GET /annual-settlements/institute/plan-details?academicYear=2025
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/plan-details')
  institutePlanDetails(
    @Req() req: AuthenticatedRequest,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    return this.service.institutePlanDetails(
      req.user.instituteId,
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  /**
   * Screen 32
   * Current Annual Contract - Institute Admin
   *
   * GET /annual-settlements/institute/current?academicYear=2025
   */
  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN', 'SUPER_ADMIN', 'ADMIN')
  @Get('institute/current')
  currentForMyInstitute(
    @Req() req: AuthenticatedRequest,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    return this.service.currentForInstitute(
      req.user.instituteId,
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  /**
   * Screen 21 list / raw settlements list
   *
   * GET /annual-settlements?academicYear=2025
   * GET /annual-settlements?instituteId=1&academicYear=2025
   */
  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('instituteId') instituteIdRaw?: string,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    return this.service.findAll({
      requesterRole: req.user.role,
      requesterInstituteId: req.user.instituteId,
      selectedInstituteId: instituteIdRaw ? Number(instituteIdRaw) : undefined,
      academicYear: academicYearRaw ? Number(academicYearRaw) : undefined,
    });
  }

  /**
   * Screen 22
   * Institution Settlement Details
   *
   * GET /annual-settlements/:contractId
   */
  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get(':contractId')
  findOne(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.findOne(contractId, {
      requesterRole: req.user.role,
      requesterInstituteId: req.user.instituteId,
    });
  }
}
