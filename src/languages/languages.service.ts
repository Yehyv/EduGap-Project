/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Language } from './entities/language.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { SystemUser } from 'src/system-users/entities/system-user.entity';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
  ) {}

  // helper: حوّل boolean -> 0/1 (مع default)
  private toFlag(v: boolean | undefined, def: 0 | 1): 0 | 1 {
    if (typeof v === 'boolean') return v ? 1 : 0;
    return def;
  }

  /** Create */
  async create(dto: CreateLanguageDto, userId: number): Promise<Language> {
    const systemUser = await this.systemUserRepo.findOne({ where: { id: userId } });
    if (!systemUser) {
      throw new NotFoundException('System user not found');
    }
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
      createdBy: systemUser,
    });

    return this.languageRepo.save(lang);
  }

  /** List (غير المحذوفة) */
  async findAll(){
    const languages = await this.languageRepo.find({
      where: { deletedAt: IsNull() },
      order: { id: 'ASC' },
      relations: ['createdBy'],
    });
    return languages.map((c) => {
      return {
        ...c,
        createdBy: c.createdBy ? {
          id: c.createdBy.id,
          name: c.createdBy.full_name,
        } : null,
      };
    });
  }

  /** List (غير المحذوفة) */
  async findAllSimple(): Promise<Language[]> {
    return this.languageRepo.find({
      where: { deletedAt: IsNull() },
      order: { id: 'ASC' },
      relations: ['createdBy'],
    });
  }

  /** Get one (غير محذوف) */
  async findOne(id: number) {
    const language = await this.languageRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['createdBy'],
    });
    if (!language) throw new NotFoundException('Language not found');
    return {
      ...language,
      createdBy: language.createdBy ? {
        id: language.createdBy.id,
        name: language.createdBy.full_name,
      } : null,
    };
  }

  /** Update */
  async update(id: number, dto: UpdateLanguageDto) {
    const language = await this.languageRepo.findOneBy({ id });
    if (!language) {
      throw new NotFoundException('Language not found');
    }

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
  }

  /** Soft delete */
  async softDelete(id: number): Promise<{ message: string }> {
    const language = await this.languageRepo.findOneBy({ id });
    if (!language) {
      throw new NotFoundException('Language not found');
    }
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
