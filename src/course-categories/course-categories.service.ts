import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseCategory } from './entities/course-category.entity';
import { CourseCategoryTranslation } from './entities/course-category-translation.entity';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { Language } from 'src/languages/entities/language.entity';

@Injectable()
export class CourseCategoriesService {
  constructor(
    @InjectRepository(CourseCategory)
    private readonly categoryRepo: Repository<CourseCategory>,

    @InjectRepository(CourseCategoryTranslation)
    private readonly translationRepo: Repository<CourseCategoryTranslation>,

    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
  ) {}

  // ✅ CREATE
  async create(dto: CreateCourseCategoryDto) {
    const category = this.categoryRepo.create({
      isActive: dto.isActive ?? 1,
    });

    const savedCategory = await this.categoryRepo.save(category);

    for (const t of dto.translations) {
      const language = await this.languageRepo.findOne({
        where: { id: t.languageId },
      });

      if (!language)
        throw new NotFoundException(`Language ${t.languageId} not found`);

      const translation = this.translationRepo.create({
        name: t.name,
        description: t.description,
        courseCategory: savedCategory,
        language,
      });

      await this.translationRepo.save(translation);
    }

    return this.findOne(savedCategory.id);
  }

  // ✅ FIND ALL (with language)
  async findAll(languageId?: number) {
    const categories = await this.categoryRepo.find({
      relations: ['translations', 'translations.language'],
      order: { id: 'ASC' },
    });

    return categories.map((cat) => {
      const selected =
        languageId && cat.translations.length
          ? cat.translations.find((t) => t.language.id === languageId)
          : cat.translations[0];

      return {
        id: cat.id,
        name: selected?.name ?? null,
        description: selected?.description ?? null,
        isActive: cat.isActive,
      };
    });
  }

  // ✅ FIND ONE
  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });

    if (!category)
      throw new NotFoundException(`CourseCategory ${id} not found`);

    return {
      id: category.id,
      isActive: category.isActive,
      translations: category.translations.map((t) => ({
        name: t.name,
        description: t.description,
        languageId: t.language.id,
      })),
    };
  }

  // ✅ UPDATE
  async update(id: number, dto: UpdateCourseCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });

    if (!category)
      throw new NotFoundException(`CourseCategory ${id} not found`);

    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    if (dto.translations) {
      for (const t of dto.translations) {
        const existing = category.translations.find(
          (tr) => tr.language.id === t.languageId,
        );

        if (existing) {
          existing.name = t.name ?? existing.name;
          existing.description = t.description ?? existing.description;
          await this.translationRepo.save(existing);
        } else {
          if (!t.languageId || !t.name || !t.description)
            throw new BadRequestException(
              'New translation requires name, description and languageId',
            );

          const language = await this.languageRepo.findOne({
            where: { id: t.languageId },
          });

          if (!language)
            throw new NotFoundException(`Language ${t.languageId} not found`);

          const newTranslation = this.translationRepo.create({
            name: t.name,
            description: t.description,
            language,
            courseCategory: category,
          });

          await this.translationRepo.save(newTranslation);
        }
      }
    }

    await this.categoryRepo.save(category);
    return this.findOne(id);
  }

  // ✅ SOFT DELETE
  async remove(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category)
      throw new NotFoundException(`CourseCategory ${id} not found`);

    await this.categoryRepo.softRemove(category);

    return {
      message: `CourseCategory ${id} removed successfully`,
    };
  }
}
