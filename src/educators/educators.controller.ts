import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EducatorsService } from './educators.service';
import { CreateEducatorDto } from './dto/create-educator.dto';
import { UpdateEducatorDto } from './dto/update-educator.dto';

@Controller('educators')
export class EducatorsController {
  constructor(private readonly educatorsService: EducatorsService) {}

  @Post()
  create(@Body() createEducatorDto: CreateEducatorDto) {
    return this.educatorsService.create(createEducatorDto);
  }

  @Get()
  findAll() {
    return this.educatorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.educatorsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEducatorDto: UpdateEducatorDto,
  ) {
    return this.educatorsService.update(+id, updateEducatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.educatorsService.remove(+id);
  }
}
