import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CancelContractPaymentDto } from './dto/cancel-contract-payment.dto';
import { CreateContractPaymentDto } from './dto/create-contract-payment.dto';
import { UpdateContractPaymentDto } from './dto/update-contract-payment.dto';
import { ContractPaymentsService } from './contract-payments.service';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string; instituteId: number; role?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ContractPaymentsController {
  constructor(private readonly service: ContractPaymentsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('contract-payments')
  create(
    @Body() dto: CreateContractPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.create(dto, req.user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute-annual-contracts/:contractId/payments')
  findByContract(@Param('contractId', ParseIntPipe) contractId: number) {
    return this.service.findByContract(contractId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('contract-payments/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-payments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractPaymentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-payments/:id/cancel')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelContractPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.cancel(id, dto, req.user.sub);
  }
}
