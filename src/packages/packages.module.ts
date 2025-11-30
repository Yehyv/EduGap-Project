// src/packages/packages.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { PackageContentsController } from './packages-content.controller';

import { Package } from './entities/package.entity';
import { PackageTranslation } from './entities/package-translation.entity';
import { PackageContent } from './entities/package-content.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Content } from 'src/contents/entities/content.entity';

import { ContentsModule } from 'src/contents/contents.module'; // <-- هنا
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { SavedPackage } from 'src/saved-packages/entities/saved-package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Package,
      PackageTranslation,
      PackageContent,
      Language,
      Content,
      Enrollment,
      LessonProgress,
      SavedPackage,
    ]),
    ContentsModule, // <-- أهم سطر: عشان يوفر ContentsService للكنترولر
  ],
  controllers: [PackagesController, PackageContentsController],
  providers: [PackagesService], // مفيش ContentsService هنا
})
export class PackagesModule {}
