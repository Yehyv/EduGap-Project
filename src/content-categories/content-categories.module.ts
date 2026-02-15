import { Module } from '@nestjs/common';
import { ContentCategoriesService } from './content-categories.service';
import { ContentCategoriesController } from './content-categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentCategory } from './entities/content-category.entity';
import { ContentCategoryTranslation } from './entities/content-category-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { Content } from 'src/contents/entities/content.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContentCategory,
      ContentCategoryTranslation,
      Language,
      Content,
      SystemUser,
    ]),
  ],
  controllers: [ContentCategoriesController],
  providers: [ContentCategoriesService],
})
export class ContentCategoriesModule {}
