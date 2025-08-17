import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { Repository, IsNull } from 'typeorm';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language) private languageRepo: Repository<Language>,
  ) {}

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    if (createLanguageDto.isDefault) {
      await this.languageRepo.update({ isDefault: true }, { isDefault: false });
    }
    const language = this.languageRepo.create(createLanguageDto);
    return this.languageRepo.save(language);
  }

  async findAll(): Promise<Language[]> {
    return this.languageRepo.find({ where: { deletedAt: IsNull() } });
  }

  async findOne(id: number): Promise<Language> {
    const language = await this.languageRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  async update(
    id: number,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    const language = await this.findOne(id);
    if (updateLanguageDto.isDefault) {
      await this.languageRepo.update({ isDefault: true }, { isDefault: false });
    }
    Object.assign(language, updateLanguageDto);
    return this.languageRepo.save(language);
  }
  async softDelete(id: number): Promise<{ message: string }> {
    const language = await this.findOne(id);
    await this.languageRepo.softRemove(language);
    return { message: 'langauge deleted successfully' };
  }

  async restore(id: number): Promise<void> {
    await this.languageRepo.restore(id);
  }
}
