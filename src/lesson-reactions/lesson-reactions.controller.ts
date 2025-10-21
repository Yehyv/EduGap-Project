import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LessonReactionsService } from './lesson-reactions.service';
import { CreateLessonReactionDto } from './dto/create-lesson-reaction.dto';
import { UpdateLessonReactionDto } from './dto/update-lesson-reaction.dto';

@Controller('lesson-reactions')
export class LessonReactionsController {
  constructor(
    private readonly lessonReactionsService: LessonReactionsService,
  ) {}

  @Post()
  create(@Body() createLessonReactionDto: CreateLessonReactionDto) {
    return this.lessonReactionsService.create(createLessonReactionDto);
  }

  @Get()
  findAll() {
    return this.lessonReactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonReactionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonReactionDto: UpdateLessonReactionDto,
  ) {
    return this.lessonReactionsService.update(+id, updateLessonReactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonReactionsService.remove(+id);
  }
}
