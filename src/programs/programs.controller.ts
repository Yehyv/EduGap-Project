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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { imageStorage } from 'src/common/helpers/upload.helper';

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
  @UseInterceptors(
    FileInterceptor(
      'logo',
      imageStorage('program-images'),
    ),
  )
  create(@Body() dto: CreateProgramDto, @UploadedFile() logo?: Express.Multer.File) {
    return this.programsService.create(dto, logo);
  }
  @Get('super-admin/programs-list')
  findAll(@Headers('languageId') languageId?: string) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.programsService.findAll(langId);
  }
  @Get('super-admin/program/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.findOne(id);
  }
  @Get('super-admin/dropdown/list')
  programDropDown(
    @Query('instituteId') instituteId: number,
    @Headers('languageId') languageId: number | undefined,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const instId = Number(instituteId);
    return this.programsService.ProgramDropDown(instId,langId);
  }
  @Get('super-admin/dropdown/user/list')
  programsForUserDropDown(
    @Headers('languageId') languageId: number | undefined,
    @Query('instituteId') instituteId: number,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const instId = Number(instituteId);
    return this.programsService.ProgramsForUserDropDown(instId, langId);
  }
  
  @Get('super-admin/dropdown/inst-CP')
  instProgCourses(
    @Query('instituteId') instituteId: number,
    @Headers('languageId') languageId: number,
  ) {
    const langId = languageId? Number(languageId) : undefined;
    const instId = Number(instituteId);
    return this.programsService.programsAndCoursesForInstitute(instId, langId)
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
  findAllIsolatedByInstitute(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const instituteId = req.user!.instituteId;
    return this.programsService.findAProgramsForInstitute(langId, instituteId);
  }

  /** برنامج واحد (Isolation بالمعهد) */
  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  findOneIsolatedByInstitute(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    const instituteId = req.user!.instituteId;
    return this.programsService.findOneAProgramForInstitute(id, instituteId, langId);
  }

  /** تحديث برنامج (logo + translations) */
  @Patch('super-admin/:id')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor(
      'logo',
      imageStorage('program-images'),
    )
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgramDto,
    @UploadedFile() logo?: Express.Multer.File

  ) {
    return this.programsService.update(id, dto, logo);
  }

  /** حذف برنامج (soft delete) */
  @Delete('super-admin/:id')
  // @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.remove(id);
  }
  @Patch('super-admin/prorgram-status/:id')
  async changeProgramStatus(@Param('id', ParseIntPipe) id: number) {
    return this.programsService.toggleActive(id);
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
