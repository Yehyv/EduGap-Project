import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(createLessonDto, req.user.instituteId);
  }

  @Get()
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId !== undefined ? +languageId : 0;
    if (langId) {
      return this.lessonsService.findAll(req.user.instituteId, langId);
    }
    return this.lessonsService.findAll(req.user.instituteId);
  }

  @Get(':id')
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lessonsService.findOne(id, req.user.instituteId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(
      id,
      updateLessonDto,
      req.user.instituteId,
    );
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: number) {
    return this.lessonsService.remove(id, req.user.instituteId);
  }
}
