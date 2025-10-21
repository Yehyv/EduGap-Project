import { Injectable } from '@nestjs/common';
import { CreateLessonCommentDto } from './dto/create-lesson-comment.dto';
import { UpdateLessonCommentDto } from './dto/update-lesson-comment.dto';

@Injectable()
export class LessonCommentsService {
  create(createLessonCommentDto: CreateLessonCommentDto) {
    return 'This action adds a new lessonComment';
  }

  findAll() {
    return `This action returns all lessonComments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonComment`;
  }

  update(id: number, updateLessonCommentDto: UpdateLessonCommentDto) {
    return `This action updates a #${id} lessonComment`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonComment`;
  }
}
