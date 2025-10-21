import { Injectable } from '@nestjs/common';
import { CreateLessonReactionDto } from './dto/create-lesson-reaction.dto';
import { UpdateLessonReactionDto } from './dto/update-lesson-reaction.dto';

@Injectable()
export class LessonReactionsService {
  create(createLessonReactionDto: CreateLessonReactionDto) {
    return 'This action adds a new lessonReaction';
  }

  findAll() {
    return `This action returns all lessonReactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonReaction`;
  }

  update(id: number, updateLessonReactionDto: UpdateLessonReactionDto) {
    return `This action updates a #${id} lessonReaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonReaction`;
  }
}
