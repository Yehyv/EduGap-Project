// src/lesson-materials/lesson-materials.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { LessonMaterialsService } from './lesson-materials.service';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-lesson-material.dto';
import { CreateMaterialTypeInlineDto } from './dto/create-material-type-inline.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import type { Request as ExpressRequest } from 'express';
import type { Response } from 'express';
@Controller('lesson-materials')
export class LessonMaterialsController {
  constructor(private readonly service: LessonMaterialsService) {}

  /**
   * POST /lesson-materials
   * إنشاء مرفق جديد (بيشتق content تلقائي من lesson -> topic -> content)
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination(
          _req: ExpressRequest,
          _file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ): void {
          const dest = path.join(process.cwd(), 'uploads', 'materials');
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename(
          _req: ExpressRequest,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ): void {
          try {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${unique}${ext}`);
          } catch {
            cb(
              new BadRequestException(
                'File processing error',
              ) as unknown as Error,
              '',
            );
          }
        },
      }),
      fileFilter(
        _req: ExpressRequest,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
      ): void {
        if (!/\.(pdf|jpg|jpeg|png)$/i.test(file.originalname)) {
          return cb(
            new BadRequestException(
              'Only PDF/JPG/PNG allowed',
            ) as unknown as Error,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateLessonMaterialDto,
  ) {
    console.log('DTO received:', dto);
    console.log('Translations length:', dto?.translations?.length);

    const saved = await this.service.create({
      ...dto,
      file: file?.filename ?? dto.file ?? undefined,
    });

    return {
      ...saved,
      fileUrl: saved.file
        ? `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/materials/${saved.file}`
        : null,
    };
  }
  @Get(':id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const m = await this.service.findOne(id); // رجّع فيه m.file
    if (!m?.file) throw new NotFoundException('File not found');

    const filePath = path.join(process.cwd(), 'uploads', 'materials', m.file);
    if (!fs.existsSync(filePath)) throw new NotFoundException('File missing');
    return res.download(filePath, m.file); // 👈 attachment + filename
  }

  /**
   * GET /lesson-materials
   * ليستة إدارية لكل المرفقات (اختياري languageId كـ query)
   */
  @Get()
  findAll(@Query('languageId') languageId?: string) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findAll(langId);
  }

  @Post('types')
  createMaterialType(@Body() dto: CreateMaterialTypeInlineDto) {
    return this.service.createMaterialType(dto);
  }

  /** DELETE /lesson-materials/types/:id — حذف نوع مرفق (soft delete) */
  @Delete('types/:id')
  deleteMaterialType(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteMaterialType(id);
  }

  /**
   * GET /lesson-materials/:id
   * مرفق واحد (اختياري languageId كـ هيدر)
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findOne(id, langId);
  }

  /**
   * GET /lesson-materials/lesson/:lessonId
   * مرفقات درس معيّن (اختياري languageId كـ هيدر)
   */
  @Get('lesson/:lessonId')
  findByLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findByLesson(lessonId, langId);
  }

  /**
   * GET /lesson-materials/content/:contentId
   * كل مرفقات الكورس (العامة + مرفقات كل الدروس التابعة له)
   * (اختياري languageId كـ هيدر)
   */
  @Get('content/:contentId')
  findByContent(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.service.findByContent(contentId, langId);
  }

  /**
   * PATCH /lesson-materials/:id
   * تعديل المرفق (ولو اتغير الدرس بيتعاد اشتقاق الـ content تلقائي)
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonMaterialDto,
  ) {
    return this.service.update(id, dto);
  }

  /**
   * DELETE /lesson-materials/:id
   * حذف سوفت
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
