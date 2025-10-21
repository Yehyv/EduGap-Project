import { Injectable } from '@nestjs/common';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-lesson-material.dto';

@Injectable()
export class LessonMaterialsService {
  create(createLessonMaterialDto: CreateLessonMaterialDto) {
    return 'This action adds a new lessonMaterial';
  }

  findAll() {
    return `This action returns all lessonMaterials`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonMaterial`;
  }

  update(id: number, updateLessonMaterialDto: UpdateLessonMaterialDto) {
    return `This action updates a #${id} lessonMaterial`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonMaterial`;
  }
}
