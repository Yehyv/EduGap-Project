import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';

@Controller('course-categories')
export class CourseCategoriesController {
  constructor(private readonly service: CourseCategoriesService) {}

  @Post()
  create(@Body() dto: CreateCourseCategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Headers('languageId') languageId?: string) {
    return this.service.findAll(languageId ? Number(languageId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseCategoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
