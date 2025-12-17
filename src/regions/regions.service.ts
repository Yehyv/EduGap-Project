import { Injectable } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { Repository } from 'typeorm';
import { RegionTranslation } from './entities/region-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { City } from 'src/cities/entities/city.entity';
interface RegionDropDownRaw {
  id: number;
  name: string;
}
@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region) private regionRepository: Repository<Region>,
    @InjectRepository(RegionTranslation)
    private readonly regionTranslationRepository: Repository<RegionTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}
  async create(createRegionDto: CreateRegionDto) {
    const city = await this.cityRepository.findOne({
      where: { id: createRegionDto.cityId },
    });
    if (!city)
      throw new Error(`City with id ${createRegionDto.cityId} not found`);
    const region = this.regionRepository.create({
      city: city,
      isActive: 1,
    });
    const savedRegion = await this.regionRepository.save(region);
    const translations = await Promise.all(
      createRegionDto.translations.map(async (t) => {
        const language = await this.languageRepository.findOneBy({
          id: t.languageId,
        });
        if (!language)
          throw new Error(`Language with id ${t.languageId} not found`);
        const translation = this.regionTranslationRepository.create({
          name: t.name,
          language: language,
          region: savedRegion,
        });
        return this.regionTranslationRepository.save(translation);
      }),
    );
    return { ...savedRegion, translations };
  }

  async findAll(languageId?: number) {
    const regions = await this.regionRepository.find({
      relations: ['translations', 'translations.language'],
    });
    if (!regions.length) return [];
    return regions.map((c) => {
      const tr =
        c.translations.find((t) => t.language.id === languageId) ||
        c.translations[0];
      return {
        id: c.id,
        isActive: c.isActive,
        name: tr?.name,
      };
    });
  }

  async findOne(id: number, languageId?: number) {
    const region = await this.regionRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!region) return null;
    const tr =
      region.translations.find((t) => t.language.id === languageId) ||
      region.translations[0];
    return {
      id: region.id,
      isActive: region.isActive,
      name: tr?.name,
    };
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    const region = await this.regionRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
    if (!region) throw new Error(`region with id ${id} not found`);
    if (updateRegionDto.cityId) {
      const city = await this.cityRepository.findOneBy({
        id: updateRegionDto.cityId,
      });
      if (!city)
        throw new Error(`City with id ${updateRegionDto.cityId} not found`);
      region.city = city;
    }
    if (updateRegionDto.translations?.length) {
      for (const t of updateRegionDto.translations) {
        const language = await this.languageRepository.findOneBy({
          id: t.languageId,
        });
        if (!language)
          throw new Error(`Language with id ${t.languageId} not found`);
        const existing = region.translations?.find(
          (tr) => tr.language.id === t.languageId,
        );
        if (existing) {
          existing.name = t.name;
          await this.regionTranslationRepository.save(existing);
        } else {
          const translation = this.regionTranslationRepository.create({
            name: t.name,
            language: language,
            region: region,
          });
          await this.regionTranslationRepository.save(translation);
        }
      }
    }
    return this.regionRepository.save(region);
  }

  async remove(id: number) {
    const region = await this.regionRepository.findOneBy({ id });
    if (!region) {
      throw new Error(`City with id ${id} not found`);
    }
    await this.regionRepository.softDelete(id);
  }
  async RegionDropDown(cityId: number, languageId?: number) {
    const query = this.regionRepository
      .createQueryBuilder('region')
      .leftJoin(
        'region.translations',
        'translation',
        languageId ? 'translation.languageId = :languageId' : undefined,
        { languageId },
      )
      .innerJoin('region.city', 'city', 'city.id = :cityId', { cityId })
      .leftJoin('translation.language', 'language');
    const rows = await query
      .select(['region.id AS id', 'translation.name AS name'])
      .getRawMany<RegionDropDownRaw>();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
    }));
  }
}
