import { Injectable } from '@nestjs/common';
import { CreateSavedLessonDto } from './dto/create-saved-lesson.dto';
import { UpdateSavedLessonDto } from './dto/update-saved-lesson.dto';

@Injectable()
export class SavedLessonService {
  create(createSavedLessonDto: CreateSavedLessonDto) {
    return 'This action adds a new savedLesson';
  }

  findAll() {
    return `This action returns all savedLesson`;
  }

  findOne(id: number) {
    return `This action returns a #${id} savedLesson`;
  }

  update(id: number, updateSavedLessonDto: UpdateSavedLessonDto) {
    return `This action updates a #${id} savedLesson`;
  }

  remove(id: number) {
    return `This action removes a #${id} savedLesson`;
  }
}
