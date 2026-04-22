import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import {
  ActivationReason,
  ActivationReasonType,
} from './entities/activation-reason.entity';
import { ActivationReasonTranslation } from './entities/activation-reason-translation.entity';
import { Language } from 'src/languages/entities/language.entity';
import { CreateActivationReasonDto } from './dto/create-activation-reason.dto';
import { UpdateActivationReasonDto } from './dto/update-activation-reason.dto';

@Injectable()
export class ActivationReasonsService {
  constructor(
    @InjectRepository(ActivationReason)
    private readonly activationReasonRepo: Repository<ActivationReason>,
    @InjectRepository(ActivationReasonTranslation)
    private readonly activationReasonTranslationRepo: Repository<ActivationReasonTranslation>,
    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
  ) {}

  private normalizeType(type?: string): ActivationReasonType | undefined {
    if (!type) return undefined;

    const normalized = type.trim().toUpperCase();

    if (
      normalized !== ActivationReasonType.ACTIVE &&
      normalized !== ActivationReasonType.INACTIVE
    ) {
      throw new BadRequestException('type must be ACTIVE or INACTIVE');
    }

    return normalized as ActivationReasonType;
  }

  private normalizeOnlyActive(onlyActiveRaw?: string): boolean {
    return onlyActiveRaw === undefined
      ? true
      : ['1', 'true', 'yes'].includes(onlyActiveRaw.toLowerCase());
  }

  private pickTranslation(
    translations: ActivationReasonTranslation[] = [],
    languageId?: number,
  ) {
    if (!translations.length) return undefined;
    if (!languageId) return translations[0];

    return (
      translations.find((t) => t.language?.id === languageId) || translations[0]
    );
  }

  private async validateLanguages(languageIds: number[]) {
    const uniqueLanguageIds = [...new Set(languageIds)];

    if (uniqueLanguageIds.length !== languageIds.length) {
      throw new BadRequestException(
        'Each translation must have a unique languageId',
      );
    }

    const languages = await this.languageRepo.find({
      where: { id: In(uniqueLanguageIds) },
    });

    if (languages.length !== uniqueLanguageIds.length) {
      throw new NotFoundException('One or more languages were not found');
    }

    return new Map(languages.map((lang) => [lang.id, lang]));
  }

  async create(dto: CreateActivationReasonDto) {
    const languageMap = await this.validateLanguages(
      dto.translations.map((t) => t.languageId),
    );

    const activationReason = this.activationReasonRepo.create({
      type: dto.type,
      notes: dto.notes?.trim() || null,
      is_active: dto.is_active ?? 1,
      translations: dto.translations.map((t) =>
        this.activationReasonTranslationRepo.create({
          reason: t.reason.trim(),
          language: languageMap.get(t.languageId)!,
        }),
      ),
    });

    const saved = await this.activationReasonRepo.save(activationReason);

    return this.findOne(saved.id);
  }

  async findAll(languageId?: number, type?: string, onlyActiveRaw?: string) {
    const normalizedType = this.normalizeType(type);
    const onlyActive = this.normalizeOnlyActive(onlyActiveRaw);

    const where: FindOptionsWhere<ActivationReason> = {};

    if (normalizedType) {
      where.type = normalizedType;
    }

    if (onlyActive) {
      where.is_active = 1;
    }

    const reasons = await this.activationReasonRepo.find({
      where,
      relations: ['translations', 'translations.language'],
      order: {
        id: 'DESC',
      },
    });

    return reasons.map((item) => {
      const tr = this.pickTranslation(item.translations, languageId);

      return {
        id: item.id,
        type: item.type,
        notes: item.notes,
        is_active: item.is_active,
        reason: tr?.reason ?? null,
        languageId: tr?.language?.id ?? null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });
  }

  async findOne(id: number, languageId?: number) {
    const reason = await this.activationReasonRepo.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });

    if (!reason) {
      throw new NotFoundException(`Activation reason with id ${id} not found`);
    }

    const tr = this.pickTranslation(reason.translations, languageId);

    return {
      id: reason.id,
      type: reason.type,
      notes: reason.notes,
      is_active: reason.is_active,
      reason: tr?.reason ?? null,
      languageId: tr?.language?.id ?? null,
      created_at: reason.created_at,
      updated_at: reason.updated_at,
      translations: reason.translations.map((t) => ({
        id: t.id,
        reason: t.reason,
        languageId: t.language.id,
        languageName: t.language.name,
      })),
    };
  }

  async update(id: number, dto: UpdateActivationReasonDto) {
    const reason = await this.activationReasonRepo.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });

    if (!reason) {
      throw new NotFoundException(`Activation reason with id ${id} not found`);
    }

    if (dto.type !== undefined) {
      reason.type = dto.type;
    }

    if (dto.notes !== undefined) {
      reason.notes = dto.notes?.trim() || null;
    }

    if (dto.is_active !== undefined) {
      reason.is_active = dto.is_active;
    }

    await this.activationReasonRepo.save(reason);

    if (dto.translations?.length) {
      const languageMap = await this.validateLanguages(
        dto.translations.map((t) => t.languageId),
      );

      for (const t of dto.translations) {
        const existing = reason.translations.find(
          (tr) => tr.language.id === t.languageId,
        );

        if (existing) {
          existing.reason = t.reason.trim();
          await this.activationReasonTranslationRepo.save(existing);
        } else {
          const newTranslation = this.activationReasonTranslationRepo.create({
            reason: t.reason.trim(),
            language: languageMap.get(t.languageId)!,
            activationReason: reason,
          });

          await this.activationReasonTranslationRepo.save(newTranslation);
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const reason = await this.activationReasonRepo.findOne({
      where: { id },
    });

    if (!reason) {
      throw new NotFoundException(`Activation reason with id ${id} not found`);
    }

    await this.activationReasonRepo.softRemove(reason);

    return {
      message: 'Activation reason deleted successfully',
      id,
    };
  }
}
