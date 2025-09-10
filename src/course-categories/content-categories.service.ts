import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { ContentCategory } from './entities/content-category.entity';
import { ContentCategoryTranslation } from './entities/content-category-translation.entity';
import { CreateContentCategoryDto } from './dto/create-content-category.dto';
import { UpdateContentCategoryDto } from './dto/update-content-category.dto';

@Injectable()
export class ContentCategoriesService {
  constructor(
    @InjectRepository(ContentCategory)
    private categoryRepository: Repository<ContentCategory>,
    @InjectRepository(ContentCategoryTranslation)
    private translationRepository: Repository<ContentCategoryTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async create(dto: CreateContentCategoryDto) {
    const category = this.categoryRepository.create();
    const savedCategory = await this.categoryRepository.save(category);

    const translations = await Promise.all(
      dto.translations.map(async (t) => {
        const language = await this.languageRepository.findOne({
          where: { id: t.languageId },
        });
        if (!language)
          throw new NotFoundException(
            `Language with ID ${t.languageId} not found`,
          );

        const translation = this.translationRepository.create({
          name: t.name,
          description: t.description,
          contentCategory: savedCategory,
          language,
        });
        return this.translationRepository.save(translation);
      }),
    );

    return { ...savedCategory, translations };
  }

  async findAll(languageId?: number) {
    const categories = await this.categoryRepository.find({
      relations: ['translations', 'translations.language'],
    });

    return categories.map((cat) => {
      const selectedTranslation = languageId
        ? cat.translations.find((t) => t.language.id === languageId)
        : cat.translations[0];

      return {
        id: cat.id,
        name: selectedTranslation?.name || null,
        description: selectedTranslation?.description || null,
      };
    });
  }

  async findOne(id: number, languageId?: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });

    if (!category) throw new NotFoundException(`Category ${id} not found`);

    const selectedTranslation = languageId
      ? category.translations.find((t) => t.language.id === languageId)
      : category.translations[0];

    return {
      id: category.id,
      name: selectedTranslation?.name || null,
      description: selectedTranslation?.description || null,
    };
  }

  async update(id: number, dto: UpdateContentCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    if (dto.translations) {
      const translationsData = await Promise.all(
        dto.translations.map(async (t) => {
          const language = await this.languageRepository.findOne({
            where: { id: t.languageId },
          });
          if (!language)
            throw new NotFoundException(`Language ${t.languageId} not found`);

          return this.translationRepository.create({
            name: t.name,
            description: t.description,
            language,
          });
        }),
      );

      await this.translationRepository.upsert(translationsData, {
        conflictPaths: ['category', 'language'], // لازم يبقى عندك @Unique(['category','language']) في الترانسليشن
        skipUpdateIfNoValuesChanged: true,
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    await this.categoryRepository.softRemove(category);
    return { message: `Category ${id} has been removed` };
  }
}
