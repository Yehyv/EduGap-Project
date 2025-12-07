import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  create(@Body() createLanguageDto: CreateLanguageDto) {
    return this.languagesService.create(createLanguageDto);
  }

  @Get('super-admin/languages-list')
  findAll() {
    return this.languagesService.findAll();
  }

  @Get(':id/super-admin/language')
  findOne(@Param('id') id: number) {
    return this.languagesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return this.languagesService.update(+id, updateLanguageDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: number) {
    return this.languagesService.softDelete(+id);
  }
  @Patch('restore/:id')
  restore(@Param('id') id: number) {
    return this.languagesService.restore(+id);
  }
}
