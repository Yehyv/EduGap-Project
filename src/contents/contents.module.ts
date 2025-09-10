import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { ContentTranslation } from './entities/content-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Course } from 'src/courses/entities/course.entity';
import { ContentCategory } from 'src/course-categories/entities/content-category.entity';
import { Educator } from 'src/educators/entities/educator.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Content,
      ContentTranslation,
      Language,
      Course,
      ContentCategory,
      Educator,
    ]),
  ],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
