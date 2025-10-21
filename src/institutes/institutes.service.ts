/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Institute } from './entities/institute.entity';
import { In, Repository } from 'typeorm';
import { instituteTranslation } from './entities/institute-translation.entity';
import { Language } from 'src/languages/entities/language.entity';

@Injectable()
export class InstitutesService {
  constructor(
    @InjectRepository(Institute)
    private instituteRepository: Repository<Institute>,
    @InjectRepository(instituteTranslation)
    private instituteTranslationRepository: Repository<instituteTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}


async create(createInstituteDto: CreateInstituteDto) {
  const trs = createInstituteDto.translations ?? [];
  if (!trs.length) {
    throw new BadRequestException('At least one translation is required');
  }

  // 1) اتأكد من اللغات قبل أي حفظ
  const langIds = trs.map(t => t.languageId);
  const languages = await this.languageRepository.findBy({ id: In(langIds) });
  if (languages.length !== langIds.length) {
    const found = new Set(languages.map(l => l.id));
    const missing = langIds.filter(id => !found.has(id));
    throw new NotFoundException(`Languages not found: ${missing.join(', ')}`);
  }

  // 2) احفظ المعهد مرّة واحدة
  const institute = this.instituteRepository.create({
    logo: createInstituteDto.logo,
    image_profile: createInstituteDto.image_profile,
    email: createInstituteDto.email,
    phone_key: createInstituteDto.phone_key,
    phone: createInstituteDto.phone,
    location: createInstituteDto.location,
  });
  const savedInstitute = await this.instituteRepository.save(institute);

  // 3) خزّن الترجمات (بعد ما بقى عندك id)
  const translations = await Promise.all(
    trs.map(async (t) => {
      const lang = languages.find(l => l.id === t.languageId)!;
      const tr = this.instituteTranslationRepository.create({
        name: t.name,
        address: t.address,
        institute: savedInstitute,
        language: lang,
      });
      return this.instituteTranslationRepository.save(tr);
    })
  );

  return { ...savedInstitute, translations };
}


  async findAll(languageId?: number) {
    const institutes = await this.instituteRepository
      .createQueryBuilder('institute')
      .leftJoinAndSelect(
        'institute.translations',
        'translation',
        languageId ? 'translation.language.id = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('translation.language', 'language')
      .getMany();

    return institutes.map((institute) => {
      let selectedTranslation: instituteTranslation;
      if (languageId) {
        selectedTranslation = institute.translations[0] || null;
      } else {
        selectedTranslation = institute.translations[0] || null;
      }
      return { ...institute, translation: selectedTranslation };
    });
  }

  async findOne(id: number, languageId?: number) {
    const institute = await this.instituteRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!institute) {
      throw new NotFoundException(`Institute with ID ${id} not found`);
    }

    const selectedTranslation =
      institute.translations.find(
        (translation) => translation.language.id === languageId,
      ) || institute.translations[0];

    return { ...institute, translation: selectedTranslation };
  }

  async update(id: number, updateInstituteDto: UpdateInstituteDto) {
    const institute = await this.instituteRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!institute) throw new NotFoundException(`Institute ${id} not found`);

    // تعديل بيانات الـ Institute
    Object.assign(institute, {
      logo: updateInstituteDto.logo ?? institute.logo,
      image_profile: updateInstituteDto.image_profile ?? institute.image_profile,
      email: updateInstituteDto.email ?? institute.email,
      phone_key: updateInstituteDto.phone_key ?? institute.phone_key,
      phone: updateInstituteDto.phone ?? institute.phone,
      location: updateInstituteDto.location ?? institute.location,
    });
    await this.instituteRepository.save(institute);

    if (updateInstituteDto.translations) {
      // استخدام upsert للتراجم
      const translationsData = await Promise.all(
        updateInstituteDto.translations.map(async (t) => {
          const language = await this.languageRepository.findOne({
            where: { id: t.languageId },
          });
          if (!language)
            throw new NotFoundException(`Language ${t.languageId} not found`);

          return this.instituteTranslationRepository.create({
            name: t.name,
            address: t.address,
            language,
            institute,
          });
        }),
      );

      await this.instituteTranslationRepository.upsert(translationsData, {
        conflictPaths: ['institute', 'language'], // بفضل الـ @Unique
        skipUpdateIfNoValuesChanged: true,
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const institute = await this.instituteRepository.findOne({
      where: { id },
    });
    if (!institute) throw new NotFoundException(`Institute ${id} not found`);
    await this.instituteRepository.softRemove(institute);
    return { message: `Institute ${id} has been removed` };
  }
}
