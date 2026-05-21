import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CollectionSummaryQueryDto } from './dto/collection-summary-query.dto';
import { BillingReportsService } from './billing-reports.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
@Controller('billing-reports')
export class BillingReportsController {
  constructor(private readonly service: BillingReportsService) {}

  @Get('upcoming-payments')
  upcoming(@Query('days') daysRaw?: string) {
    return this.service.upcomingPayments(daysRaw ? Number(daysRaw) : 15);
  }

  @Get('overdue-installments')
  overdue() {
    return this.service.overdueInstallments();
  }

  @Get('collection-summary')
  collectionSummary(@Query() query: CollectionSummaryQueryDto) {
    return this.service.collectionSummary(query);
  }

  @Get('payment-percentage')
  paymentPercentageReport(@Query('academicYear') academicYearRaw?: string) {
    return this.service.paymentPercentageReport(
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  @Get('discount-tax')
  discountTaxReport(@Query('academicYear') academicYearRaw?: string) {
    return this.service.discountTaxReport(
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  @Get('administrative-fees')
  administrativeFeesReport(@Query('academicYear') academicYearRaw?: string) {
    return this.service.administrativeFeesReport(
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  @Get('yearly-revenue')
  yearlyRevenue() {
    return this.service.yearlyRevenue();
  }

  @Get('added-students')
  addedStudentsReport(@Query('academicYear') academicYearRaw?: string) {
    return this.service.addedStudentsReport(
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }
}