import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LessonCommentsService } from './lesson-comments.service';
import { CreateLessonCommentDto } from './dto/create-lesson-comment.dto';
import { UpdateLessonCommentDto } from './dto/update-lesson-comment.dto';

@Controller('lesson-comments')
export class LessonCommentsController {
  constructor(private readonly lessonCommentsService: LessonCommentsService) {}

  @Post()
  create(@Body() createLessonCommentDto: CreateLessonCommentDto) {
    return this.lessonCommentsService.create(createLessonCommentDto);
  }

  @Get()
  findAll() {
    return this.lessonCommentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonCommentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonCommentDto: UpdateLessonCommentDto,
  ) {
    return this.lessonCommentsService.update(+id, updateLessonCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonCommentsService.remove(+id);
  }
}
