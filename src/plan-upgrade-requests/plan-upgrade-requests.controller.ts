import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreatePlanUpgradeRequestDto } from './dto/create-plan-upgrade-request.dto';
import { PlanUpgradeRequestsService } from './plan-upgrade-requests.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    role?: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plan-upgrade-requests')
export class PlanUpgradeRequestsController {
  constructor(private readonly service: PlanUpgradeRequestsService) {}

  @Roles('INST_ADMIN', 'INSTITUTE_ADMIN')
  @Post('institute')
  createForInstitute(
    @Body() dto: CreatePlanUpgradeRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.createForInstitute(dto, req.user);
  }
}