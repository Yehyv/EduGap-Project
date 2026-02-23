import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { CountryTranslation } from './entities/country-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
interface CountryDropDownRaw {
  id: number;
  name: string;
}
@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country) private countryRepository: Repository<Country>,
    @InjectRepository(CountryTranslation)
    private countryTranslationRepository: Repository<CountryTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(SystemUser)
    private systemUserRepository: Repository<SystemUser>,
  ) {}
  async create(createCountryDto: CreateCountryDto, userId: number) {
    const user = await this.systemUserRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    const country = this.countryRepository.create({
      isActive: 1,
      createdBy: user,
    });
    const savedCountry = await this.countryRepository.save(country);
    const translations = await Promise.all(
      createCountryDto.translations.map(async (t) => {
        const language = await this.languageRepository.findOneBy({
          id: t.languageId,
        });
        if (!language) {
          throw new Error(`Language with id ${t.languageId} not found`);
        }
        const translation = this.countryTranslationRepository.create({
          name: t.name,
          language: language,
          country: savedCountry,
        });
        return this.countryTranslationRepository.save(translation);
      }),
    );
    return { ...savedCountry };
  }

  async findAll(languageId?: number) {
    const countries = await this.countryRepository.find({
      relations: ['translations', 'translations.language', 'createdBy'],
    });
    if (!countries.length) return [];
    return countries.map((c) => {
      const tr =
        c.translations.find((t) => t.language.id === languageId) ||
        c.translations[0];
      return {
        id: c.id,
        createdBy: {
          id: c.createdBy?.id,
          name: c.createdBy?.full_name,
        },
        isActive: c.isActive,
        createdAt: c.createdAt,
        name: tr?.name,
      };
    });
  }

  async findOne(id: number) {
    const country = await this.countryRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language', 'createdBy'],
    });

    if (!country) return null;

    return {
      id: country.id,
      isActive: country.isActive,
      createdBy: {
        id: country.createdBy?.id,
        name: country.createdBy?.full_name,
      },
      translations: country.translations.map((t) => ({
        name: t.name,
        languageId: t.language.id,
      })),
    };
  }

  async update(id: number, updateCountryDto: UpdateCountryDto) {
    const country = await this.countryRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
      },
    });
    if (!country) {
      throw new Error(`Country with id ${id} not found`);
    }
    if (updateCountryDto.translations?.length) {
      for (const t of updateCountryDto.translations) {
        const language = await this.languageRepository.findOneBy({
          id: t.languageId,
        });
        if (!language) {
          throw new Error(`Language with id ${t.languageId} not found`);
        }
        const existing = country.translations?.find(
          (tr) => tr.language.id === t.languageId,
        );
        if (existing) {
          existing.name = t.name;
          await this.countryTranslationRepository.save(existing);
        } else {
          const newTranslation = this.countryTranslationRepository.create({
            name: t.name,
            language: language,
            country,
          });
          await this.countryTranslationRepository.save(newTranslation);
        }
      }
    }
  }

  async remove(id: number) {
    const country = await this.countryRepository.findOneBy({ id });
    if (!country) {
      throw new Error(`Country with id ${id} not found`);
    }
    await this.countryRepository.softDelete(id);
  }
  async CountryDropDown(languageId?: number) {
    const query = this.countryRepository
      .createQueryBuilder('country')
      .leftJoin(
        'country.translations',
        'translation',
        languageId ? 'translation.language.id = :languageId' : undefined,
        { languageId },
      )
      .leftJoin('translation.language', 'language');
    const rows = await query
      .select(['country.id AS id', 'translation.name AS name'])
      .getRawMany<CountryDropDownRaw>();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
    }));
  }
}
