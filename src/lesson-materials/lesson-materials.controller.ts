import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LessonMaterialsService } from './lesson-materials.service';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-lesson-material.dto';

@Controller('lesson-materials')
export class LessonMaterialsController {
  constructor(
    private readonly lessonMaterialsService: LessonMaterialsService,
  ) {}

  @Post()
  create(@Body() createLessonMaterialDto: CreateLessonMaterialDto) {
    return this.lessonMaterialsService.create(createLessonMaterialDto);
  }

  @Get()
  findAll() {
    return this.lessonMaterialsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonMaterialsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonMaterialDto: UpdateLessonMaterialDto,
  ) {
    return this.lessonMaterialsService.update(+id, updateLessonMaterialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonMaterialsService.remove(+id);
  }
}
