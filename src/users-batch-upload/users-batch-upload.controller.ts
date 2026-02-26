import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
  ParseIntPipe,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import express from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersBatchUploadService } from './users-batch-upload.service';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

@Controller('users-batch-upload')
export class UsersBatchUploadController {
  constructor(
    private readonly usersBatchUploadService: UsersBatchUploadService,
  ) {}

  @Get('template')
  downloadTemplate(@Res({ passthrough: false }) res: express.Response) {
    const filePath = join(process.cwd(), 'templates', 'students-template.xlsx');

    return res.download(filePath, 'students-template.xlsx');
  }

  /* =========================
     2️⃣ Upload & Process Excel
  ========================= */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBatch(
    @UploadedFile() file: Express.Multer.File,
    @Body('instituteId', ParseIntPipe) instituteId: number,
    @Req() req: AuthenticatedRequest,
    @Query('programId') programId?: string,
  ) {
    const progId = programId ? Number(programId) : undefined;
    return this.usersBatchUploadService.processUpload(
      file,
      instituteId,
      req.user.sub,
      progId,
    );
  }
  // @UseGuards(JwtAuthGuard)
  @Get(':batchId/rejected-excel')
  async downloadRejectedExcel(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Res() res: express.Response,
  ) {
    const buffer =
      await this.usersBatchUploadService.downloadRejectedExcel(batchId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="rejected-rows-${batchId}.xlsx"`,
    );

    res.end(buffer); // 👈 مش send JSON
  }

  /* =========================
     3️⃣ Get Batch Details
  ========================= */

  @Get(':batchId')
  getBatchDetails(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.usersBatchUploadService.getBatchDetails(batchId);
  }
}
