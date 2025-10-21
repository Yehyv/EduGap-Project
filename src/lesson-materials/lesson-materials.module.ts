import { Module } from '@nestjs/common';
import { LessonMaterialsService } from './lesson-materials.service';
import { LessonMaterialsController } from './lesson-materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonMaterial } from './entities/lesson-material.entity';
import { LessonMaterialTranslation } from './entities/lesson-material-translation.entity';
import { MaterialType } from './entities/material-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LessonMaterial,
      LessonMaterialTranslation,
      MaterialType,
    ]),
  ],
  controllers: [LessonMaterialsController],
  providers: [LessonMaterialsService],
})
export class LessonMaterialsModule {}
