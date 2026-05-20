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
import { GenerateInstallmentsDto } from './dto/generate-installments.dto';
import { UpdateContractInstallmentDto } from './dto/update-contract-installment.dto';
import { FindContractInstallmentsQueryDto } from './dto/find-contract-installments-query.dto';
import { ContractInstallmentsService } from './contract-installments.service';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    role?: string;
  };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ContractInstallmentsController {
  constructor(private readonly service: ContractInstallmentsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('contract-installments')
  findAll(
    @Query() query: FindContractInstallmentsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.findAll(query, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute-annual-contracts/:contractId/installments')
  findByContract(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Query() query: FindContractInstallmentsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.findAll({ ...query, contractId }, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('contract-installments/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.findOne(id, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('institute-annual-contracts/:contractId/installments/generate-info')
  getGenerateInfo(@Param('contractId', ParseIntPipe) contractId: number) {
    return this.service.getGenerateInfo(contractId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('institute-annual-contracts/:contractId/installments/preview')
  preview(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body() dto: GenerateInstallmentsDto,
  ) {
    return this.service.preview(contractId, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('institute-annual-contracts/:contractId/installments/generate')
  generate(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body() dto: GenerateInstallmentsDto,
  ) {
    return this.service.generate(contractId, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute-annual-contracts/:contractId/installments/summary')
  summary(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.summary(contractId, req.user);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-installments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractInstallmentDto,
  ) {
    return this.service.update(id, dto);
  }
}
