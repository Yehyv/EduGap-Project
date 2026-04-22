import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivationReasonsService } from './activation-reasons.service';
import { CreateActivationReasonDto } from './dto/create-activation-reason.dto';
import { UpdateActivationReasonDto } from './dto/update-activation-reason.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('activation-reasons')
export class ActivationReasonsController {
  constructor(
    private readonly activationReasonsService: ActivationReasonsService,
  ) {}

  @Post()
  create(@Body() dto: CreateActivationReasonDto) {
    return this.activationReasonsService.create(dto);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    return this.activationReasonsService.findAll(type, onlyActive);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.activationReasonsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActivationReasonDto,
  ) {
    return this.activationReasonsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.activationReasonsService.remove(id);
  }
}
