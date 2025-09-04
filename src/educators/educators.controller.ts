import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 8;

    return this.educatorsService.findAll(pageNumber, limitNumber);
  }

  @Get('first-8')
  findFirst8Educators() {
    return this.educatorsService.findFirst8Educators();
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
