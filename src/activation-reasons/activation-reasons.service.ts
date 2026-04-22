import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  ActivationReason,
  ActivationReasonType,
} from './entities/activation-reason.entity';
import { CreateActivationReasonDto } from './dto/create-activation-reason.dto';
import { UpdateActivationReasonDto } from './dto/update-activation-reason.dto';

@Injectable()
export class ActivationReasonsService {
  constructor(
    @InjectRepository(ActivationReason)
    private readonly activationReasonRepo: Repository<ActivationReason>,
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

  async create(dto: CreateActivationReasonDto) {
    const cleanedReason = dto.reason.trim();

    const existing = await this.activationReasonRepo.findOne({
      where: {
        reason: cleanedReason,
        type: dto.type,
      },
    });

    if (existing) {
      throw new BadRequestException('Reason already exists for this type');
    }

    const reason = this.activationReasonRepo.create({
      reason: cleanedReason,
      type: dto.type,
      notes: dto.notes?.trim() || null,
      is_active: dto.is_active ?? 1,
    });

    return this.activationReasonRepo.save(reason);
  }

  async findAll(type?: string, onlyActiveRaw?: string) {
    const normalizedType = this.normalizeType(type);

    const onlyActive =
      onlyActiveRaw === undefined
        ? true
        : ['1', 'true', 'yes'].includes(onlyActiveRaw.toLowerCase());

    const where: FindOptionsWhere<ActivationReason> = {};

    if (normalizedType) {
      where.type = normalizedType;
    }

    if (onlyActive) {
      where.is_active = 1;
    }

    return this.activationReasonRepo.find({
      where,
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const reason = await this.activationReasonRepo.findOne({
      where: { id },
    });

    if (!reason) {
      throw new NotFoundException(`Activation reason with id ${id} not found`);
    }

    return reason;
  }

  async update(id: number, dto: UpdateActivationReasonDto) {
    const reasonEntity = await this.findOne(id);

    const nextReason = dto.reason?.trim() ?? reasonEntity.reason;
    const nextType = dto.type ?? reasonEntity.type;

    const duplicate = await this.activationReasonRepo.findOne({
      where: {
        reason: nextReason,
        type: nextType,
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new BadRequestException('Reason already exists for this type');
    }

    reasonEntity.reason = nextReason;
    reasonEntity.type = nextType;

    if (dto.notes !== undefined) {
      reasonEntity.notes = dto.notes?.trim() || null;
    }

    if (dto.is_active !== undefined) {
      reasonEntity.is_active = dto.is_active;
    }

    return this.activationReasonRepo.save(reasonEntity);
  }

  async remove(id: number) {
    const reason = await this.findOne(id);
    await this.activationReasonRepo.softRemove(reason);

    return {
      message: 'Activation reason deleted successfully',
      id,
    };
  }
}
