import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AnnualSettlementsService } from './annual-settlements.service';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string; instituteId: number; role?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('annual-settlements')
export class AnnualSettlementsController {
  constructor(private readonly service: AnnualSettlementsService) {}

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

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get(':contractId')
  findOne(@Param('contractId', ParseIntPipe) contractId: number) {
    return this.service.findOne(contractId);
  }
}
