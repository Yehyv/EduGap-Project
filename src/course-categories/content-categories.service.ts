import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    private readonly categoryRepository: Repository<ContentCategory>,

    @InjectRepository(ContentCategoryTranslation)
    private readonly translationRepository: Repository<ContentCategoryTranslation>,

    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  // ✅ إنشاء تصنيف محتوى جديد
  async create(dto: CreateContentCategoryDto) {
    const category = this.categoryRepository.create({
      is_active: 1,
    });

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

  // ✅ عرض كل التصنيفات مع الترجمة المناسبة
  async findAll(languageId?: number) {
    const categories = await this.categoryRepository.find({
      relations: ['translations', 'translations.language'],
      order: { id: 'ASC' },
    });

    return categories.map((cat) => {
      const selectedTranslation =
        languageId && cat.translations.length
          ? cat.translations.find((t) => t.language.id === languageId)
          : cat.translations[0];

      return {
        id: cat.id,
        name: selectedTranslation?.name ?? null,
        description: selectedTranslation?.description ?? null,
        is_active: cat.is_active,
      };
    });
  }

  // ✅ عرض تصنيف واحد حسب اللغة
  async findOne(id: number, languageId?: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });

    if (!category) throw new NotFoundException(`Category ${id} not found`);

    const selectedTranslation =
      languageId && category.translations.length
        ? category.translations.find((t) => t.language.id === languageId)
        : category.translations[0];

    return {
      id: category.id,
      name: selectedTranslation?.name ?? null,
      description: selectedTranslation?.description ?? null,
      is_active: category.is_active,
    };
  }

  // ✅ تحديث التصنيف والترجمات الخاصة به
  // ✅ تحديث التصنيف والترجمات الخاصة به
  async update(id: number, dto: UpdateContentCategoryDto) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    // تحديث الحالة لو موجودة
    if (dto.is_active !== undefined) category.is_active = dto.is_active;

    // تحديث الترجمات
    if (dto.translations && dto.translations.length > 0) {
      for (const t of dto.translations) {
        // لو languageId مبعوت، هاته. (لو مش مبعوت في حالة update-existing، هنستخدم الموجود)
        let language: Language | null = null;
        if (typeof t.languageId === 'number') {
          language = await this.languageRepository.findOne({
            where: { id: t.languageId },
          });
          if (!language) {
            throw new NotFoundException(`Language ${t.languageId} not found`);
          }
        }

        const existing = category.translations.find(
          (tr) => tr.language.id === t.languageId,
        );

        if (existing) {
          // 👈 هنا استخدم القيمة الحالية لو الحقل undefined
          existing.name = t.name ?? existing.name;
          existing.description = t.description ?? existing.description;

          // لو حدّثت اللغة اختياريًا
          if (language) existing.language = language;

          await this.translationRepository.save(existing);
        } else {
          // إضافة ترجمة جديدة: لازم name/description/languageId
          if (!t.name || !t.description || typeof t.languageId !== 'number') {
            throw new BadRequestException(
              'For new translation, name, description and languageId are required',
            );
          }

          // language أكيد موجود هنا (لأننا تحقّقنا فوق)
          const newTranslation = this.translationRepository.create({
            name: t.name,
            description: t.description,
            language: language!, // مضمون بعد الفحص
            contentCategory: category,
          });
          await this.translationRepository.save(newTranslation);
        }
      }
    }

    await this.categoryRepository.save(category);
    return this.findOne(id);
  }

  // ✅ حذف التصنيف (soft delete)
  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    await this.categoryRepository.softRemove(category);
    return { message: `Category ${id} has been removed successfully` };
  }
}
