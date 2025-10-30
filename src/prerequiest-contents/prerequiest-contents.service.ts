import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Content } from 'src/contents/entities/content.entity';
import { PrerequisiteContent } from './entities/prerequiest-content.entity';
import { AssignPrerequisitesDto } from './dto/assign-prerequisites.dto';
import { UnassignPrerequisiteDto } from './dto/unassign-prerequisite.dto';

@Injectable()
export class PrerequisitesService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(PrerequisiteContent)
    private readonly prereqRepo: Repository<PrerequisiteContent>,
  ) {}

  async list(contentId: number) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content) throw new NotFoundException('Content not found');

    return this.prereqRepo.find({
      where: { contentId },
      relations: ['prerequisiteContent'],
      order: { id: 'ASC' },
    });
  }

  async assign(contentId: number, dto: AssignPrerequisitesDto) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content) throw new NotFoundException('Content not found');

    const ids = dto.items.map((i) => i.preId);
    // منع self-dependency
    if (ids.includes(contentId)) {
      throw new BadRequestException(
        'Content cannot be a prerequisite of itself',
      );
    }

    // تأكد أن كل الـ prerequisites موجودة
    const prereqContents = await this.contentRepo.find({
      where: { id: In(ids) },
      select: ['id'],
    });
    const foundIds = new Set(prereqContents.map((x) => x.id));
    const missing = ids.filter((x) => !foundIds.has(x));
    if (missing.length) {
      throw new NotFoundException(
        `Prerequisite content(s) not found: ${missing.join(', ')}`,
      );
    }

    // (اختياري) تحقّق من الدورة المباشرة A->B & B->A
    const immediateCycle = await this.prereqRepo.find({
      where: { contentId: In(ids), prerequisiteContentId: contentId },
      select: ['contentId', 'prerequisiteContentId'],
    });
    if (immediateCycle.length) {
      throw new BadRequestException(
        'Immediate cycle detected (a prerequisite points back to this content).',
      );
    }

    // أنشئ أو تحدّث (UPSERT بسيط عبر unique)
    const toSave = dto.items.map((i) =>
      this.prereqRepo.create({
        content: { id: contentId },
        prerequisiteContent: { id: i.preId },
        type: i.type,
      }),
    );

    await this.prereqRepo.save(toSave);
    return this.list(contentId);
  }

  async unassign(contentId: number, dto: UnassignPrerequisiteDto) {
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content) throw new NotFoundException('Content not found');

    const existing = await this.prereqRepo.findOne({
      where: {
        contentId,
        prerequisiteContentId: dto.prerequisiteContentId,
      },
    });
    if (!existing) throw new NotFoundException('Prerequisite not found');

    await this.prereqRepo.remove(existing);
    return { message: 'Unassigned successfully' };
  }
}
