import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlansService } from './subscription-plans.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    role?: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly service: SubscriptionPlansService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(
    @Body() dto: CreateSubscriptionPlanDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.create(dto, req.user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get()
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.service.findAll(onlyActive);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleStatus(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get(':id/institutes')
  institutes(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    return this.service.getInstitutesUsingPlan(
      id,
      languageId ? Number(languageId) : undefined,
    );
  }
}
