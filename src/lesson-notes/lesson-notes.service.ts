import { Injectable } from '@nestjs/common';
import { CreateLessonNoteDto } from './dto/create-lesson-note.dto';
import { UpdateLessonNoteDto } from './dto/update-lesson-note.dto';

@Injectable()
export class LessonNotesService {
  create(createLessonNoteDto: CreateLessonNoteDto) {
    return 'This action adds a new lessonNote';
  }

  findAll() {
    return `This action returns all lessonNotes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonNote`;
  }

  update(id: number, updateLessonNoteDto: UpdateLessonNoteDto) {
    return `This action updates a #${id} lessonNote`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonNote`;
  }
}
