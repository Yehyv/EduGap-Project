import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreatePlanUpgradeRequestDto } from './dto/create-plan-upgrade-request.dto';
import { FindPlanUpgradeRequestsQueryDto } from './dto/find-plan-upgrade-requests-query.dto';
import {
  ApprovePlanUpgradeRequestDto,
  RejectPlanUpgradeRequestDto,
} from './dto/review-plan-upgrade-request.dto';
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

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  findAll(@Query() query: FindPlanUpgradeRequestsQueryDto) {
    return this.service.findAllForReview(query);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { request: await this.service.findOneForReview(id) };
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovePlanUpgradeRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.approve(id, req.user.sub, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectPlanUpgradeRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.reject(id, req.user.sub, dto);
  }
}
