import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { BillingDashboardService } from './billing-dashboard.service';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string; instituteId: number; role?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing-dashboard')
export class BillingDashboardController {
  constructor(private readonly service: BillingDashboardService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('super-admin')
  superAdmin(@Query('academicYear') academicYearRaw?: string) {
    return this.service.superAdmin(
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN', 'SUPER_ADMIN', 'ADMIN')
  @Get('institute')
  institute(
    @Req() req: AuthenticatedRequest,
    @Query('instituteId') instituteIdRaw?: string,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    const isInstituteAdmin = ['INST_ADMIN', 'INSTITUTE_ADMIN'].includes(
      String(req.user.role || '')
        .trim()
        .toUpperCase(),
    );
    const instituteId = isInstituteAdmin
      ? req.user.instituteId
      : instituteIdRaw
        ? Number(instituteIdRaw)
        : req.user.instituteId;
    return this.service.institute(
      instituteId,
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }
}
