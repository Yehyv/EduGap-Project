import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SavedLessonService } from './saved-lesson.service';
import { CreateSavedLessonDto } from './dto/create-saved-lesson.dto';
import { UpdateSavedLessonDto } from './dto/update-saved-lesson.dto';

@Controller('saved-lesson')
export class SavedLessonController {
  constructor(private readonly savedLessonService: SavedLessonService) {}

  @Post()
  create(@Body() createSavedLessonDto: CreateSavedLessonDto) {
    return this.savedLessonService.create(createSavedLessonDto);
  }

  @Get()
  findAll() {
    return this.savedLessonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savedLessonService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSavedLessonDto: UpdateSavedLessonDto,
  ) {
    return this.savedLessonService.update(+id, updateSavedLessonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savedLessonService.remove(+id);
  }
}
