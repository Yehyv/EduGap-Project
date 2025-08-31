import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Institute } from './entities/institute.entity';
import { Repository } from 'typeorm';
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
    const institute = this.instituteRepository.create({
      logo: createInstituteDto.logo,
      profileImage: createInstituteDto.profileImage,
      email: createInstituteDto.email,
      phone: createInstituteDto.phone,
    });
    const savedInstitute = await this.instituteRepository.save(institute);
    const translations = await Promise.all(
      createInstituteDto.translations.map(async (translation) => {
        const Language = await this.languageRepository.findOne({
          where: { id: translation.languageId },
        });
        if (!Language) {
          throw new Error(
            `Language with ID ${translation.languageId} not found`,
          );
        }
        const instituteTranslation = this.instituteTranslationRepository.create(
          {
            name: translation.name,
            address: translation.address,
            institute: { id: savedInstitute.id },
            language: { id: Language.id },
          },
        );
        return this.instituteTranslationRepository.save(instituteTranslation);
      }),
    );
    return { ...savedInstitute, translations };
  }

  async findAll(languageId?: number) {
    const institutes = await this.instituteRepository
      .createQueryBuilder('institute')
      .leftJoinAndSelect(
        'institute.translations',
        'translation',
        languageId ? 'translation.language.id = "languageId"' : undefined,
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
      throw new Error(`Institute with ID ${id} not found`);
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

    if (updateInstituteDto.translations) {
      // نستخدم upsert بدل اللفه كلها
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
        conflictPaths: ['institute', 'language'], // ده بفضل الـ @Unique
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
