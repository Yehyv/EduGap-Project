import { Module } from '@nestjs/common';
import { LessonMaterialsService } from './lesson-materials.service';
import { LessonMaterialsController } from './lesson-materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonMaterial } from './entities/lesson-material.entity';
import { LessonMaterialTranslation } from './entities/lesson-material-translation.entity';
import { MaterialType } from './entities/material-type.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LessonMaterial,
      LessonMaterialTranslation,
      MaterialType,
      Content,
      Language,
      Lesson,
    ]),
  ],
  controllers: [LessonMaterialsController],
  providers: [LessonMaterialsService],
})
export class LessonMaterialsModule {}
