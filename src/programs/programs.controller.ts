/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  /** إنشاء برنامج (بدون ربط بمعهد) */
  @Post()
  // @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProgramDto) {
    return this.programsService.create(dto);
  }

  /** برامج عامة متاحة للاختيار (من غير عزل معهد) */
  @Get('selection')
  findAllForSelection(@Headers('languageId') languageId?: string) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.programsService.findAllForSelection(langId);
  }

  /** برامج المعهد الحالي فقط (Isolation بالمعهد من الـ JWT) */
  @Get()
  // @UseGuards(JwtAuthGuard)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const instituteId = req.user!.instituteId;
    return this.programsService.findAll(langId, instituteId);
  }

  /** برنامج واحد (Isolation بالمعهد) */
  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const instituteId = req.user!.instituteId;
    return this.programsService.findOne(id, instituteId, langId);
  }

  /** تحديث برنامج (logo + translations) */
  @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programsService.update(id, dto);
  }

  /** حذف برنامج (soft delete) */
  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.remove(id);
  }

  /** تعيين برنامج لمعهد واحد (زي ما السيرفس معرف) */
  @Patch(':programId/institutes/:instituteId')
  // @UseGuards(JwtAuthGuard)
  assignProgramToInstitute(
    @Param('programId', ParseIntPipe) programId: number,
    @Param('instituteId', ParseIntPipe) instituteId: number,
  ) {
    return this.programsService.assignProgramToInstitute(instituteId, programId);
  }

  /** إزالة البرنامج من مجموعة معاهد */
  // @Delete(':programId/institutes')
  // @UseGuards(JwtAuthGuard)
  // removeFromInstitutes(
  //   @Param('programId', ParseIntPipe) programId: number,
  //   @Body('instituteIds') instituteIds: number[],
  // ) {
  //   return this.programsService.removeFromInstitutes(programId, instituteIds);
  // }
  @Delete(':programId/institutes/:instituteId')
// @UseGuards(JwtAuthGuard)
removeFromInstitute(
  @Param('programId', ParseIntPipe) programId: number,
  @Param('instituteId', ParseIntPipe) instituteId: number,
) {
  return this.programsService.removeFromInstitute(programId, instituteId);
}
/** Restore ربط برنامج لمعهد واحد بعد soft delete */
@Patch(':programId/institutes/:instituteId/restore')
restoreOne(
  @Param('programId', ParseIntPipe) programId: number,
  @Param('instituteId', ParseIntPipe) instituteId: number,
) {
  return this.programsService.restoreProgramForInstitute(programId, instituteId);
}
}
