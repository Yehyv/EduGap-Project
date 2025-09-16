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
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

// اضافة الـ interface للـ Request
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

// @UseGuards(JwtAuthGuard) // فعّل الـ Guard
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programsService.create(createProgramDto);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    const userInstituteId = req.user ? req.user.instituteId : undefined;

    return this.programsService.findAll(userInstituteId, langId);
  }
  @Get('first-8')
  findfirstEight(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    const userInstituteId = req.user ? req.user.instituteId : undefined;
    return this.programsService.findFirstEigh(langId, userInstituteId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    return this.programsService.findOne(+id, req.user.instituteId, langId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.programsService.update(
      +id,
      updateProgramDto,
      req.user.instituteId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.programsService.remove(+id, req.user.instituteId);
  }

  // هذول الـ methods مش محتاجين تعديل كتير لأنهم للـ admin
  @Patch(':id/institutes')
  assignToInstitutes(
    @Param('id', ParseIntPipe) programId: number,
    @Body('instituteIds') instituteIds: number[],
  ) {
    return this.programsService.assignToInstitutes(programId, instituteIds);
  }

  @Delete(':id/institutes')
  removeFromInstitutes(
    @Param('id', ParseIntPipe) programId: number,
    @Body('instituteIds') instituteIds: number[],
  ) {
    return this.programsService.removeFromInstitutes(programId, instituteIds);
  }
}
