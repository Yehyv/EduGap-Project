// src/lesson-materials/lesson-materials.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';

import { LessonMaterial } from './entities/lesson-material.entity';
import { LessonMaterialTranslation } from './entities/lesson-material-translation.entity';
import { MaterialType } from './entities/material-type.entity';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { Content } from 'src/contents/entities/content.entity';
import { Language } from 'src/languages/entities/language.entity';
import { CreateMaterialTypeInlineDto } from './dto/create-material-type-inline.dto';
import { CreateLessonMaterialDto } from './dto/create-lesson-material.dto';
import { UpdateLessonMaterialDto } from './dto/update-lesson-material.dto';

@Injectable()
export class LessonMaterialsService {
  constructor(
    @InjectRepository(LessonMaterial)
    private readonly matRepo: Repository<LessonMaterial>,
    @InjectRepository(LessonMaterialTranslation)
    private readonly trRepo: Repository<LessonMaterialTranslation>,
    @InjectRepository(MaterialType)
    private readonly typeRepo: Repository<MaterialType>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(Language)
    private readonly langRepo: Repository<Language>,
  ) {}
  async createMaterialType(dto: CreateMaterialTypeInlineDto) {
    // اختياري: منع تكرار الاسم
    const dup = await this.typeRepo.findOne({
      where: { type_name: dto.type_name },
    });
    if (dup) {
      // لو مش فارق معاك، احذف البلوك ده
      throw new BadRequestException('type_name already exists');
    }

    const row = this.typeRepo.create({
      type_name: dto.type_name,
      type_icon: dto.type_icon,
      is_active: dto.is_active ?? 1,
    });
    return this.typeRepo.save(row);
  }

  // ✅ Delete MaterialType (soft delete)
  async deleteMaterialType(id: number) {
    const row = await this.typeRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException(`MaterialType ${id} not found`);

    // تحذير بسيط: لو فيه مواد مرتبطة بالنوع ده، الحذف ممكن يسبب لك لخبطة في الواجهة
    // عادي تخليه Soft Delete لحد ما تشيك الارتباطات حسب رغبتك.
    await this.typeRepo.softDelete(id);
    return { message: `MaterialType ${id} deleted successfully` };
  }
  private async upsertTranslations(
    material: LessonMaterial,
    translations: CreateLessonMaterialDto['translations'],
  ) {
    await this.trRepo.delete({ lessonMaterial: { id: material.id } });

    if (!translations?.length) return;

    // OPTIONAL: تحقق سريع من وجود اللغات لو حابب
    const langIds = translations.map((t) => t.languageId);
    const foundLangIds = new Set(
      (await this.langRepo.findBy({ id: In(langIds) })).map((l) => l.id),
    );
    const missing = langIds.filter((id) => !foundLangIds.has(id));
    if (missing.length) {
      throw new NotFoundException(`Missing languages: ${missing.join(', ')}`);
    }

    const rows = translations.map((t) =>
      this.trRepo.create({
        title: t.title,
        description: t.description ?? undefined,
        language: { id: t.languageId },
        lessonMaterial: { id: material.id },
      }),
    );

    await this.trRepo.save(rows);
  }

  /** Create */
  async create(dto: CreateLessonMaterialDto) {
    // هات الدرس + topic + content
    const lesson = await this.lessonRepo.findOne({
      where: { id: dto.lessonId },
      relations: ['topic', 'topic.content'],
    });
    if (!lesson)
      throw new NotFoundException(`Lesson ${dto.lessonId} not found`);

    const content = lesson.topic?.content;
    if (!content) {
      // حماية زيادة لو فيه درس مش مربوط بكونتنت عبر التوبيك
      throw new NotFoundException(
        `No content found through lesson -> topic for lesson ${dto.lessonId}`,
      );
    }

    const type = await this.typeRepo.findOne({
      where: { id: dto.materialTypeId },
    });
    if (!type)
      throw new NotFoundException(
        `MaterialType ${dto.materialTypeId} not found`,
      );

    const payload: DeepPartial<LessonMaterial> = {
      lesson,
      materialType: type,
      content, // ⬅️ اشتققناه أوتوماتيك من السلسلة
      file: dto.file ?? undefined, // لو حابب تخليها undefined بدال null عدّل الـ entity
      is_active: dto.is_active ?? 1,
    };

    const mat = this.matRepo.create(payload);
    const saved = await this.matRepo.save(mat);

    await this.upsertTranslations(saved, dto.translations);
    return this.findOne(saved.id);
  }

  /** Admin list (اختياري: languageId لتسهيل المعاينة) */
  async findAll(languageId?: number) {
    const rows = await this.matRepo.find({
      relations: [
        'lesson',
        'materialType',
        'content',
        'translations',
        'translations.language',
      ],
      order: { id: 'DESC' },
    });

    return rows.map((m) => {
      const tr =
        (languageId
          ? m.translations?.find((t) => t.language?.id === languageId)
          : null) ||
        m.translations?.[0] ||
        null;

      return {
        id: m.id,
        file: m.file,
        is_active: m.is_active,
        lessonId: m.lesson?.id ?? null,
        contentId: m.content?.id ?? null,
        materialType: m.materialType
          ? {
              id: m.materialType.id,
              name: m.materialType.type_name,
              icon: m.materialType.type_icon,
            }
          : null,
        title: tr?.title ?? '',
        description: tr?.description ?? '',
      };
    });
  }

  /** Public: list materials for a lesson (with language) */
  async findByLesson(lessonId: number, languageId?: number) {
    const rows = await this.matRepo.find({
      where: { lesson: { id: lessonId }, is_active: 1 },
      relations: ['materialType', 'translations', 'translations.language'],
      order: { id: 'DESC' },
    });

    return rows.map((m) => {
      const tr =
        (languageId
          ? m.translations?.find((t) => t.language?.id === languageId)
          : null) ||
        m.translations?.[0] ||
        null;

      return {
        id: m.id,
        file: m.file, // لو بتخزن key/URL
        materialType: m.materialType
          ? {
              id: m.materialType.id,
              name: m.materialType.type_name,
              icon: m.materialType.type_icon,
            }
          : null,
        title: tr?.title ?? '',
        description: tr?.description ?? '',
      };
    });
  }

  /** One */
  async findOne(id: number, languageId?: number) {
    const m = await this.matRepo.findOne({
      where: { id },
      relations: [
        'lesson',
        'materialType',
        'content',
        'translations',
        'translations.language',
      ],
    });
    if (!m) throw new NotFoundException(`Material ${id} not found`);

    const tr =
      (languageId
        ? m.translations?.find((t) => t.language?.id === languageId)
        : null) ||
      m.translations?.[0] ||
      null;

    return {
      id: m.id,
      file: m.file,
      is_active: m.is_active,
      lessonId: m.lesson?.id ?? null,
      contentId: m.content?.id ?? null,
      materialType: m.materialType
        ? {
            id: m.materialType.id,
            name: m.materialType.type_name,
            icon: m.materialType.type_icon,
          }
        : null,
      title: tr?.title ?? '',
      description: tr?.description ?? '',
      translations:
        m.translations?.map((t) => ({
          id: t.id,
          languageId: t.language?.id,
          title: t.title,
          description: t.description,
        })) ?? [],
    };
  }

  /** Update */
  async update(id: number, dto: UpdateLessonMaterialDto) {
    const mat = await this.matRepo.findOne({
      where: { id },
      relations: [
        'lesson',
        'lesson.topic',
        'lesson.topic.content',
        'materialType',
        'content',
      ],
    });
    if (!mat) throw new NotFoundException(`Material ${id} not found`);

    // لو غيّرت الدرس: نعيد اشتقاق الـ content من السلسلة
    if (dto.lessonId && dto.lessonId !== mat.lesson?.id) {
      const newLesson = await this.lessonRepo.findOne({
        where: { id: dto.lessonId },
        relations: ['topic', 'topic.content'],
      });
      if (!newLesson)
        throw new NotFoundException(`Lesson ${dto.lessonId} not found`);
      const derivedContent = newLesson.topic?.content;
      if (!derivedContent) {
        throw new NotFoundException(
          `No content found through lesson -> topic for lesson ${dto.lessonId}`,
        );
      }
      mat.lesson = newLesson;
      mat.content = derivedContent; // ⬅️ دايمًا متّسقة مع الدرس
    }

    if (dto.materialTypeId) {
      const type = await this.typeRepo.findOne({
        where: { id: dto.materialTypeId },
      });
      if (!type)
        throw new NotFoundException(
          `MaterialType ${dto.materialTypeId} not found`,
        );
      mat.materialType = type;
    }

    if (dto.file !== undefined) mat.file = dto.file;
    if (dto.is_active !== undefined) {
      if (![0, 1].includes(dto.is_active)) {
        throw new BadRequestException('is_active must be 0 or 1');
      }
      mat.is_active = dto.is_active;
    }

    await this.matRepo.save(mat);

    if (dto.translations) {
      await this.upsertTranslations(mat, dto.translations);
    }

    return this.findOne(id);
  }

  /** Soft delete */
  async remove(id: number) {
    const found = await this.matRepo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Material ${id} not found`);
    await this.matRepo.softDelete(id);
    return { message: `Material ${id} deleted successfully` };
  }
  async findByContent(contentId: number, languageId?: number) {
    const rows = await this.matRepo
      .createQueryBuilder('m')
      // ✅ لازم AndSelect عشان الكائن يتعبّى
      .leftJoinAndSelect('m.lesson', 'l')
      .leftJoinAndSelect('l.topic', 't')
      .leftJoinAndSelect('t.content', 'c')
      .leftJoinAndSelect('m.content', 'mc')

      .leftJoinAndSelect('m.materialType', 'mt')

      // ترجمة الماتيريال
      .leftJoinAndSelect(
        'm.translations',
        'mtr',
        languageId ? 'mtr.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('mtr.language', 'mlang')

      // ترجمة الدرس
      .leftJoinAndSelect(
        'l.translations',
        'ltr',
        languageId ? 'ltr.languageId = :languageId' : undefined,
        { languageId },
      )

      .where('m.is_active <> 0')
      .andWhere('(mc.id = :cid OR c.id = :cid)', { cid: contentId })
      .orderBy('t.id', 'ASC')
      .addOrderBy('l.order_id', 'ASC')
      .addOrderBy('l.id', 'ASC')
      .addOrderBy('m.id', 'DESC')
      .getMany();

    const byLesson = new Map<
      number,
      {
        lesson: {
          id: number;
          name: string;
          order: number;
          topicId: number | null;
        };
        materials: Array<{
          id: number;
          file: string | null;
          materialType: { id: number; name: string; icon: string } | null;
          title: string;
          description: string;
        }>;
      }
    >();

    for (const m of rows) {
      const lessonId = m.lesson?.id ?? 0;
      if (!lessonId) continue; // كان سبب الفاضي

      const lessonName = m.lesson?.translations?.[0]?.name ?? '';
      const lessonOrder = m.lesson?.order_id ?? 0;
      const topicId = m.lesson?.topic?.id ?? null;

      if (!byLesson.has(lessonId)) {
        byLesson.set(lessonId, {
          lesson: {
            id: lessonId,
            name: lessonName,
            order: lessonOrder,
            topicId,
          },
          materials: [],
        });
      }

      const tr = m.translations?.[0] ?? null;

      byLesson.get(lessonId)!.materials.push({
        id: m.id,
        file: m.file ?? null,
        materialType: m.materialType
          ? {
              id: m.materialType.id,
              name: m.materialType.type_name,
              icon: m.materialType.type_icon,
            }
          : null,
        title: tr?.title ?? '',
        description: tr?.description ?? '',
      });
    }

    return Array.from(byLesson.values());
  }
}
