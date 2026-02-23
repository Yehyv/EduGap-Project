import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from 'src/languages/entities/language.entity';
import { CityTranslation } from './entities/city-translation.entity';
import { Country } from 'src/countries/entities/country.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
interface CityDropDownRaw {
  id: number;
  name: string;
}
@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City) private cityRepository: Repository<City>,
    @InjectRepository(CityTranslation)
    private readonly cityTranslationRepository: Repository<CityTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepository: Repository<SystemUser>,
  ) {}
  async create(createCityDto: CreateCityDto, userId: number) {
    const user = await this.systemUserRepository.findOneBy({ id: userId });
    if (!user) throw new Error(`User with id ${userId} not found`);
    const country = await this.countryRepository.findOne({
      where: { id: createCityDto.countryId },
    });
    if (!country) throw new Error('Country not found');
    const city = this.cityRepository.create({
      country,
      isActive: 1,
      createdBy: user,
    });
    const savedCity = await this.cityRepository.save(city);
    const translations = await Promise.all(
      createCityDto.translations.map(async (t) => {
        const language = await this.languageRepository.findOneBy({
          id: t.languageId,
        });
        if (!language)
          throw new Error(`Language with id ${t.languageId} not found`);
        const translation = this.cityTranslationRepository.create({
          name: t.name,
          language: language,
          city: savedCity,
        });
        return this.cityTranslationRepository.save(translation);
      }),
    );
    return { ...savedCity, translations };
  }

  async findAll(languageId?: number) {
    const cities = await this.cityRepository.find({
      relations: ['translations', 'translations.language', 'createdBy'],
    });
    if (!cities.length) return [];
    return cities.map((c) => {
      const tr =
        c.translations.find((t) => t.language.id === languageId) ||
        c.translations[0];
      return {
        id: c.id,
        isActive: c.isActive,
        createdAt: c.createdAt,
        name: tr?.name,
        createdBy: {
          id: c.createdBy?.id,
          name: c.createdBy?.full_name,
        },
      };
    });
  }

  async findOne(id: number, languageId?: number) {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language', 'createdBy'],
    });
    if (!city) return null;
    const tr =
      city.translations.find((t) => t.language.id === languageId) ||
      city.translations[0];
    return {
      id: city.id,
      isActive: city.isActive,
      name: tr?.name,
      createdBy: {
        id: city.createdBy?.id,
        name: city.createdBy?.full_name,
      },
    };
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    const city = await this.cityRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!city) throw new Error(`City with id ${id} not found`);
    if (updateCityDto.countryId) {
      const country = await this.countryRepository.findOneBy({
        id: updateCityDto.countryId,
      });

      if (!country) {
        throw new Error(`Country with id ${updateCityDto.countryId} not found`);
      }

      city.country = country;
    }
    if (updateCityDto.translations?.length) {
      for (const t of updateCityDto.translations) {
        const language = await this.languageRepository.findOneBy({
          id: t.languageId,
        });
        if (!language)
          throw new Error(`Language with id ${t.languageId} not found`);
        const existing = city.translations?.find(
          (tr) => tr.language.id === t.languageId,
        );
        if (existing) {
          existing.name = t.name;
          await this.cityTranslationRepository.save(existing);
        } else {
          const translation = this.cityTranslationRepository.create({
            name: t.name,
            language: language,
            city: city,
          });
          await this.cityTranslationRepository.save(translation);
        }
      }
    }
    await this.cityRepository.save(city);
    return city;
  }

  async remove(id: number) {
    const city = await this.cityRepository.findOneBy({ id });
    if (!city) {
      throw new Error(`City with id ${id} not found`);
    }
    await this.cityRepository.softDelete(id);
  }
  async CityDropDown(countryId: number, languageId?: number) {
    const query = this.cityRepository
      .createQueryBuilder('city')
      .leftJoin(
        'city.translations',
        'translation',
        languageId ? 'translation.language.id = :languageId' : undefined,
        { languageId },
      )
      .innerJoin('city.country', 'country', 'country.id = :countryId', {
        countryId,
      })
      .leftJoin('translation.language', 'language');
    const rows = await query
      .select(['city.id AS id', 'translation.name AS name'])
      .getRawMany<CityDropDownRaw>();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
    }));
  }
}
