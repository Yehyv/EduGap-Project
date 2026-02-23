/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Institute } from './entities/institute.entity';
import { In, Repository } from 'typeorm';
import { instituteTranslation } from './entities/institute-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { SystemUser } from 'src/system-users/entities/system-user.entity';
interface InstituteFiles {
  logo?: Express.Multer.File[];
  image_profile?: Express.Multer.File[];
}
interface InstituteRaw {
  institute_id: number;
  institute_logo: string | null;
  institute_image_profile: string | null;
  phone_key: string;
  phone: string;
  email: string;
  is_active: number;
  createdAt: Date;

  it_name: string;
  it_address: string;
  it_contactPersopnName: string;
  it_contactPersonPostion: string;

  region_id: number;
  rt_name: string;

  city_id: number;
  ct_name: string;

  country_id: number;
  cot_name: string;
  created_by_name: string;
  created_by_id: number;
}
interface InstituteDropDownRaw {
  id: number;
  name: string;
}
@Injectable()
export class InstitutesService {
  constructor(
    @InjectRepository(Institute)
    private instituteRepository: Repository<Institute>,
    @InjectRepository(instituteTranslation)
    private instituteTranslationRepository: Repository<instituteTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(SystemUser)
    private systemUserRepository: Repository<SystemUser>,
  ) {}


async create(createInstituteDto: CreateInstituteDto, files: InstituteFiles, userId: number) {
  const user = await this.systemUserRepository.findOne({
    where: { id: userId },
  });
  if (!user) {
    throw new NotFoundException('User not found');
  }
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
  const baseUrl = process.env.APP_URL || '';
  const logoFile = files?.logo?.[0];
  const imageFile = files?.image_profile?.[0];

  const logoPath = logoFile ? `${baseUrl}/uploads/institute-images/${logoFile.filename}` : null;
  const imagePath = imageFile ? `${baseUrl}/uploads/institute-images/${imageFile.filename}` : null;

  

  // 2) احفظ المعهد مرّة واحدة
  const institute = this.instituteRepository.create({
    logo: logoPath,
    image_profile: imagePath,
    email: createInstituteDto.email,
    phone_key: createInstituteDto.phone_key,
    phone: createInstituteDto.phone,
    region: { id: createInstituteDto.regionId },
    is_active: 1,
    createdBy: user,
  });
  const savedInstitute = await this.instituteRepository.save(institute);

  // 3) خزّن الترجمات (بعد ما بقى عندك id)
  const translations = await Promise.all(
    trs.map(async (t) => {
      const lang = languages.find(l => l.id === t.languageId)!;
      const tr = this.instituteTranslationRepository.create({
        name: t.name,
        address: t.address,
        contactPersopnName: t.contactPersopnName,
        contactPersonPostion: t.contactPersonPostion,
        institute: savedInstitute,
        language: lang,
      });
      return this.instituteTranslationRepository.save(tr);
    })
  );

  return { ...savedInstitute, translations };
}


  async findAll(languageId?: number) {
    const qb = this.instituteRepository
    .createQueryBuilder('institute')

    // Institute translation
    .leftJoin(
      'institute.translations',
      'it',
      languageId ? 'it.language.id = :languageId' : undefined,
      { languageId },
    )
    .leftJoin('it.language', 'itLang')

    // Region
    .leftJoin('institute.region', 'region')
    .leftJoin(
      'region.translations',
      'rt',
      languageId ? 'rt.language.id = :languageId' : undefined,
      { languageId },
    )

    // City
    .leftJoin('region.city', 'city')
    .leftJoin(
      'city.translations',
      'ct',
      languageId ? 'ct.language.id = :languageId' : undefined,
      { languageId },
    )

    // Country
    .leftJoin('city.country', 'country')
    .leftJoin(
      'country.translations',
      'cot',
      languageId ? 'cot.language.id = :languageId' : undefined,
      { languageId },
    )
    .leftJoin('institute.createdBy', 'createdBy')

    .select([
      'institute.id',
      'institute.logo',
      'institute.image_profile',
      'institute.phone_key AS phone_key',
      'institute.phone AS phone',
      'institute.email AS email',
      'institute.is_active AS is_active',
      'institute.createdAt AS createdAt',
      'createdBy.id AS created_by_id',
      'createdBy.full_name AS created_by_name',



      'it.name',
      'it.address',
      'it.contactPersopnName',
      'it.contactPersonPostion',

      'region.id',
      'rt.name',

      'city.id',
      'ct.name',

      'country.id',
      'cot.name',
    ]);

  const rows = await qb.getRawMany<InstituteRaw>();

      return rows.map(r => ({
        id: r.institute_id,
        logo: r.institute_logo,
        image_profile: r.institute_image_profile,
        phone_key: r.phone_key,
        phone: r.phone,
        email: r.email,
        is_active: r.is_active,
        createdAt: r.createdAt,

        translation: {
          name: r.it_name,
          address: r.it_address,
          contactPersopnName: r.it_contactPersopnName,
          contactPersonPostion: r.it_contactPersonPostion,
        },

        region: {
          id: r.region_id,
          name: r.rt_name,
          city: {
            id: r.city_id,
            name: r.ct_name,
            country: {
              id: r.country_id,
              name: r.cot_name,
            },
          },
        },
        createdBy: {
          id: r.created_by_id,
          full_name: r.created_by_name,
        }
      }));
}


  async findOne(id: number) {
  const institute = await this.instituteRepository
    .createQueryBuilder('institute')
    .leftJoinAndSelect('institute.translations', 'it')
    .leftJoinAndSelect('it.language', 'itLang')

    .leftJoinAndSelect('institute.region', 'region')
    .leftJoinAndSelect('region.translations', 'rt')
    .leftJoinAndSelect('rt.language', 'rtLang')

    .leftJoinAndSelect('region.city', 'city')
    .leftJoinAndSelect('city.translations', 'ct')
    .leftJoinAndSelect('ct.language', 'ctLang')

    .leftJoinAndSelect('city.country', 'country')
    .leftJoinAndSelect('country.translations', 'cot')
    .leftJoinAndSelect('cot.language', 'cotLang')
    .leftJoinAndSelect('institute.createdBy', 'createdBy')

    .where('institute.id = :id', { id })
    .getOne();

  if (!institute) {
    throw new NotFoundException(`Institute with ID ${id} not found`);
  }

  return {
  id: institute.id,
  logo: institute.logo,
  image_profile: institute.image_profile,
  phone_key: institute.phone_key,
  phone: institute.phone,
  email: institute.email,
  is_active: institute.is_active,
  createdAt: institute.createdAt,

  translations: institute.translations.map(t => ({
    name: t.name,
    address: t.address,
    contactPersopnName: t.contactPersopnName,
    contactPersonPostion: t.contactPersonPostion,
  })),
  createdBy: institute.createdBy
    ? {
        id: institute.createdBy.id,
        full_name: institute.createdBy.full_name,
      }
    : null,

  region: institute.region
    ? {
        id: institute.region.id,
        translations: institute.region.translations.map(t => ({
          name: t.name,
        })),
        city: institute.region.city
          ? {
              id: institute.region.city.id,
              translations: institute.region.city.translations.map(t => ({
                name: t.name,
              })),
              country: institute.region.city.country
                ? {
                    id: institute.region.city.country.id,
                    translations:
                      institute.region.city.country.translations.map(t => ({
                        name: t.name,
                      })),
                  }
                : null,
            }
          : null,
      }
    : null,
};


  }
  async update(id: number, updateInstituteDto: UpdateInstituteDto) {
    const institute = await this.instituteRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language', 'region'],
    });
    if (!institute) throw new NotFoundException(`Institute ${id} not found`);

    // تعديل بيانات الـ Institute
    Object.assign(institute, {
      
      email: updateInstituteDto.email ?? institute.email,
      phone_key: updateInstituteDto.phone_key ?? institute.phone_key,
      phone: updateInstituteDto.phone ?? institute.phone,
      region: updateInstituteDto.regionId ?? institute.region,});
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
  async instituteNav(
    languageId?: number,
    limit: number = 20,
  ): Promise<
    Array<{
      id: number;
      name: string;
      logo: string | null;
      image_profile: string | null;
    }>
  > {
    const qb = this.instituteRepository
      .createQueryBuilder('inst')
      .leftJoinAndSelect(
        'inst.translations',
        'tr',
        languageId ? 'tr.languageId = :languageId' : undefined,
        { languageId },
      )
      .leftJoinAndSelect('tr.language', 'lang')
      .orderBy('inst.id', 'ASC')
      .limit(limit);

    const institutes = await qb.getMany();

    return institutes.map((inst) => {
      const tr =
        languageId != null
          ? inst.translations.find(
              (t: any) =>
                t?.language?.id === languageId || t?.languageId === languageId,
            ) || inst.translations[0]
          : inst.translations[0];

      return {
        id: inst.id,
        name: tr?.name ?? '',
        logo: inst.logo ?? null,
        image_profile: inst.image_profile ?? null,
      };
    });
  }
  async instituteDropDown( languageId? : number  ) {
    const query = this.instituteRepository
    .createQueryBuilder('institute')
    .leftJoin(
      'institute.translations',
      'translation',
      languageId ? 'translation.language.id = :languageId' : undefined,
      { languageId },
    )
    .leftJoin('translation.language', 'language');

    const rows = await query.select([
      'institute.id AS id',
      'translation.name AS name',
    ])
    .getRawMany<InstituteDropDownRaw>();

    return rows.map(r => ({
      id: r.id,
      name: r.name,
    }));
}
  async toggleActive(instId: number) {
    const institute = await this.instituteRepository.findOneBy({ id: instId})
    if (!institute) throw new NotFoundException(`Institute with ID ${instId} not found`);
    const instituteStatus = institute.is_active = institute.is_active ? 0 : 1;
    await this.instituteRepository.save(institute);
    return {
      message: `Institute is_active changed to ${instituteStatus}`, 
      id: institute.id,
      is_active: institute.is_active};
  }
}
