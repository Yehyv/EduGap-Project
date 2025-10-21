/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Language } from './entities/language.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
  ) {}

  // helper: حوّل boolean -> 0/1 (مع default)
  private toFlag(v: boolean | undefined, def: 0 | 1): 0 | 1 {
    if (typeof v === 'boolean') return v ? 1 : 0;
    return def;
  }

  /** Create */
  async create(dto: CreateLanguageDto): Promise<Language> {
    const name = dto.name.trim();

    // لو هي الافتراضية، اطفي أي افتراضية تانية
    const isDefault = this.toFlag(dto.isDefault, 0);
    if (isDefault === 1) {
      await this.languageRepo.update({ isDefault: 1 }, { isDefault: 0 });
    }

    const isActive = this.toFlag(dto.isActive, 1);

    const lang = this.languageRepo.create({
      name,
      isDefault: isDefault,
      isActive: isActive,
    });

    return this.languageRepo.save(lang);
  }

  /** List (غير المحذوفة) */
  async findAll(): Promise<Language[]> {
    return this.languageRepo.find({
      where: { deletedAt: IsNull() },
      order: { id: 'ASC' },
    });
  }

  /** Get one (غير محذوف) */
  async findOne(id: number): Promise<Language> {
    const language = await this.languageRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  /** Update */
  async update(id: number, dto: UpdateLanguageDto): Promise<Language> {
    const language = await this.findOne(id);

    if (typeof dto.name === 'string') {
      language.name = dto.name.trim();
    }

    if (typeof dto.isActive === 'boolean') {
      language.isActive = dto.isActive ? 1 : 0;
    }

    if (typeof dto.isDefault === 'boolean') {
      const asFlag = dto.isDefault ? 1 : 0;
      if (asFlag === 1) {
        // اجعل دي الافتراضية الوحيدة
        await this.languageRepo.update({ isDefault: 1 }, { isDefault: 0 });
      }
      language.isDefault = asFlag;
    }

    await this.languageRepo.save(language);
    return this.findOne(id);
  }

  /** Soft delete */
  async softDelete(id: number): Promise<{ message: string }> {
    const language = await this.findOne(id);
    await this.languageRepo.softRemove(language);
    return { message: 'language deleted successfully' };
  }

  /** Restore */
  async restore(id: number): Promise<void> {
    await this.languageRepo.restore(id);
  }

  /** (اختياري) احصل على اللغة الافتراضية */
  async findDefault(): Promise<Language | null> {
    const lang = await this.languageRepo.findOne({
      where: { isDefault: 1 , deletedAt: IsNull(), isActive: 1},
    });
    return lang ?? null;
  }
}
