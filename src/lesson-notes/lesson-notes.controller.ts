import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LessonNotesService } from './lesson-notes.service';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';

@Controller('lesson-notes')
export class LessonNotesController {
  constructor(private readonly lessonNotesService: LessonNotesService) {}

  @Post()
  create(@Body() createLessonNoteDto: CreateLessonNoteDto) {
    return this.lessonNotesService.create(createLessonNoteDto);
  }

  @Get()
  findAll() {
    return this.lessonNotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonNotesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonNoteDto: UpdateLessonNoteDto,
  ) {
    return this.lessonNotesService.update(+id, updateLessonNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonNotesService.remove(+id);
  }
}
