import { Module } from '@nestjs/common';
import { ContentCategoriesService } from './content-categories.service';
import { ContentCategoriesController } from './content-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentCategory } from './entities/content-category.entity';
import { ContentCategoryTranslation } from './entities/content-category-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Content } from 'src/contents/entities/content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentCategory,
      ContentCategoryTranslation,
      Language,
      Content,
    ]),
  ],
  controllers: [ContentCategoriesController],
  providers: [ContentCategoriesService],
})
export class ContentCategoriesModule {}
