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
import { CalculateContractDto } from './dto/calculate-contract.dto';
import { CreateInstituteAnnualContractDto } from './dto/create-institute-annual-contract.dto';
import { UpdateInstituteAnnualContractDto } from './dto/update-institute-annual-contract.dto';
import { InstituteAnnualContractsService } from './institute-annual-contracts.service';

interface AuthenticatedRequest extends Request {
  user: { sub: number; email: string; instituteId: number; role?: string };
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('institute-annual-contracts')
export class InstituteAnnualContractsController {
  constructor(private readonly service: InstituteAnnualContractsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('calculate')
  calculate(@Body() dto: CalculateContractDto) {
    return this.service.calculateAmounts(dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(
    @Body() dto: CreateInstituteAnnualContractDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.service.create(dto, req.user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('instituteId') instituteIdRaw?: string,
    @Query('academicYear') academicYearRaw?: string,
    @Query('status') status?: string,
    @Headers('languageid') languageId?: string,
  ) {
    return this.service.findAll({
      requesterRole: req.user.role,
      requesterInstituteId: req.user.instituteId,
      selectedInstituteId: instituteIdRaw ? Number(instituteIdRaw) : undefined,
      academicYear: academicYearRaw ? Number(academicYearRaw) : undefined,
      status,
      languageId: languageId ? Number(languageId) : undefined,
    });
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get('institute/:instituteId/current')
  getCurrentForInstitute(
    @Param('instituteId', ParseIntPipe) instituteId: number,
    @Query('academicYear') academicYearRaw?: string,
  ) {
    return this.service.getCurrentForInstitute(
      instituteId,
      academicYearRaw ? Number(academicYearRaw) : undefined,
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'INST_ADMIN', 'INSTITUTE_ADMIN')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageid') languageId?: string,
  ) {
    return this.service.findOne(
      id,
      languageId ? Number(languageId) : undefined,
    );
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInstituteAnnualContractDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/activate')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.service.close(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }
}
