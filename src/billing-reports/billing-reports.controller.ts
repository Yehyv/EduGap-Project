import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BillingReportsService } from './billing-reports.service';
import { AdministrativeFeesQueryDto } from './dto/administrative-fees-query.dto';
import { CollectionSummaryQueryDto } from './dto/collection-summary-query.dto';
import { DiscountTaxQueryDto } from './dto/discount-tax-query.dto';
import {
  ExportFinancialReportQueryDto,
  FinancialReportExportFormat,
} from './dto/export-financial-report-query.dto';
import { OverdueInstallmentsQueryDto } from './dto/overdue-installments-query.dto';
import { PaymentPercentageQueryDto } from './dto/payment-percentage-query.dto';
import { UpcomingPaymentsQueryDto } from './dto/upcoming-payments-query.dto';
import { YearlyRevenueQueryDto } from './dto/yearly-revenue-query.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('billing-reports')
export class BillingReportsController {
  constructor(private readonly service: BillingReportsService) {}

  @Get('collection-summary')
  collectionSummary(@Query() query: CollectionSummaryQueryDto) {
    return this.service.collectionSummary(query);
  }

  @Get('overdue-installments')
  overdueInstallments(@Query() query: OverdueInstallmentsQueryDto) {
    return this.service.overdueInstallments(query);
  }

  @Get('upcoming-payments')
  upcomingPayments(@Query() query: UpcomingPaymentsQueryDto) {
    return this.service.upcomingPayments(query);
  }

  @Get('payment-percentage')
  paymentPercentageReport(@Query() query: PaymentPercentageQueryDto) {
    return this.service.paymentPercentageReport(query);
  }

  @Get('discount-tax')
  discountTaxReport(@Query() query: DiscountTaxQueryDto) {
    return this.service.discountTaxReport(query);
  }

  @Get('administrative-fees')
  administrativeFeesReport(@Query() query: AdministrativeFeesQueryDto) {
    return this.service.administrativeFeesReport(query);
  }

  @Get('yearly-revenue')
  yearlyRevenue(@Query() query: YearlyRevenueQueryDto) {
    return this.service.yearlyRevenue(query);
  }

  @Get('export')
  async exportFinancialReport(
    @Query() query: ExportFinancialReportQueryDto,
    @Res() res: express.Response,
  ) {
    if (query.format === FinancialReportExportFormat.PDF) {
      throw new BadRequestException(
        'PDF export is not configured yet. Use EXCEL format.',
      );
    }

    const file = await this.service.exportFinancialReport(query);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.fileName}"`,
    );

    return res.send(file.buffer);
  }

  @Get('added-students')
  addedStudentsReport(@Query('academicYear') academicYearRaw?: string) {
    return this.service.addedStudentsReport(
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }
}
