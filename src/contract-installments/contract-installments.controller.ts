import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ContractInstallmentsService } from './contract-installments.service';
import { GenerateInstallmentsDto } from './dto/generate-installments.dto';
import { UpdateContractInstallmentDto } from './dto/update-contract-installment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ContractInstallmentsController {
  constructor(private readonly service: ContractInstallmentsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('institute-annual-contracts/:contractId/installments/generate')
  generate(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Body() dto: GenerateInstallmentsDto,
  ) {
    return this.service.generate(contractId, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute-annual-contracts/:contractId/installments')
  findByContract(@Param('contractId', ParseIntPipe) contractId: number) {
    return this.service.findByContract(contractId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('contract-installments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractInstallmentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('contract-installments/upcoming')
  upcoming(@Query('days') daysRaw?: string) {
    return this.service.upcoming(daysRaw ? Number(daysRaw) : 15);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('contract-installments/overdue')
  overdue() {
    return this.service.overdue();
  }
}
