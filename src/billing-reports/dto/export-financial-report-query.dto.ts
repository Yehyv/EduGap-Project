import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum FinancialReportType {
  COLLECTION_SUMMARY = 'COLLECTION_SUMMARY',
  DISCOUNT_TAX = 'DISCOUNT_TAX',
  ADMINISTRATIVE_FEES = 'ADMINISTRATIVE_FEES',
  YEARLY_REVENUE = 'YEARLY_REVENUE',
  OVERDUE_INSTALLMENTS = 'OVERDUE_INSTALLMENTS',
  UPCOMING_PAYMENTS = 'UPCOMING_PAYMENTS',
  PAYMENT_PERCENTAGE = 'PAYMENT_PERCENTAGE',
}

export enum FinancialReportExportFormat {
  EXCEL = 'EXCEL',
  PDF = 'PDF',
}

export class ExportFinancialReportQueryDto {
  @IsEnum(FinancialReportType)
  reportType: FinancialReportType;

  @IsEnum(FinancialReportExportFormat)
  format: FinancialReportExportFormat;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(2000)
  academicYear?: number;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  planId?: number;
}
