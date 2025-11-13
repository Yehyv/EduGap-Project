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
// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In } from 'typeorm';
// import { Content } from 'src/contents/entities/content.entity';
// import { PrerequisiteContent } from './entities/prerequiest-content.entity';
// import { AssignPrerequisitesDto } from './dto/assign-prerequisites.dto';
// import { UnassignPrerequisiteDto } from './dto/unassign-prerequisite.dto';
// import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';

// @Injectable()
// export class PrerequisitesService {
//   constructor(
//     @InjectRepository(Content)
//     private readonly contentRepo: Repository<Content>,
//     @InjectRepository(PrerequisiteContent)
//     private readonly prereqRepo: Repository<PrerequisiteContent>,
//     @InjectRepository(InstituteProgramCourse)
//     private readonly ipcRepo: Repository<InstituteProgramCourse>,
//   ) {}

//   /**
//    * Helper: يجيب الـ IPC ومعاه الـ contents اللي تحته
//    * IPC -> COURSE_CONTENT -> CONTENT
//    */
//   private async getIpcAllowedContentIds(ipcId: number): Promise<Set<number>> {
//     const ipc = await this.ipcRepo.findOne({
//       where: { id: ipcId },
//       relations: ['courseContents', 'courseContents.content'], // عدل الأسماء لو مختلفة
//     });

//     if (!ipc) {
//       throw new NotFoundException('InstituteProgramCourse not found');
//     }

//     const contents =
//       ipc.course.courseContents?.map((cc) => cc.content).filter(Boolean) ?? [];

//     if (!contents.length) {
//       // مفيش أي محتوى مربوط بالـ IPC ده
//       return new Set<number>();
//     }

//     return new Set<number>(contents.map((c) => c.id));
//   }

//   // =======================
//   //        LIST
//   // =======================
//   async list(ipcId: number, contentId: number) {
//     const allowedIds = await this.getIpcAllowedContentIds(ipcId);

//     // تأكد إن الـ content ده أصلاً موجود تحت الـ IPC
//     if (!allowedIds.has(contentId)) {
//       throw new NotFoundException(
//         'This content does not belong to this IPC or its courses',
//       );
//     }

//     return this.prereqRepo.find({
//       where: { contentId },
//       relations: ['prerequisiteContent'],
//       order: { id: 'ASC' },
//     });
//   }

//   // =======================
//   //        ASSIGN
//   // =======================
//   async assign(ipcId: number, contentId: number, dto: AssignPrerequisitesDto) {
//     const allowedIds = await this.getIpcAllowedContentIds(ipcId);

//     // تأكد إن الـ content الأساسي تحت الـ IPC
//     if (!allowedIds.has(contentId)) {
//       throw new NotFoundException('Target content does not belong to this IPC');
//     }

//     // نتأكد إن الـ content أصلاً موجود في جدول contents
//     const content = await this.contentRepo.findOne({
//       where: { id: contentId },
//     });
//     if (!content) throw new NotFoundException('Content not found');

//     const ids = dto.items.map((i) => i.preId);

//     // منع self-dependency
//     if (ids.includes(contentId)) {
//       throw new BadRequestException(
//         'Content cannot be a prerequisite of itself',
//       );
//     }

//     // تأكد إن كل الـ prereqs تحت نفس الـ IPC (مش من معهد/كورس تاني)
//     const invalid = ids.filter((id) => !allowedIds.has(id));
//     if (invalid.length) {
//       throw new BadRequestException(
//         `These prerequisite content(s) are not in this IPC: ${invalid.join(
//           ', ',
//         )}`,
//       );
//     }

//     // تأكد برضه إن الـ contents موجودة فعلاً في جدول Content (احتياطي)
//     const prereqContents = await this.contentRepo.find({
//       where: { id: In(ids) },
//       select: ['id'],
//     });
//     const foundIds = new Set(prereqContents.map((x) => x.id));
//     const missing = ids.filter((x) => !foundIds.has(x));
//     if (missing.length) {
//       throw new NotFoundException(
//         `Prerequisite content(s) not found: ${missing.join(', ')}`,
//       );
//     }

//     // تحقّق من الدورة المباشرة A->B & B->A (global per content)
//     const immediateCycle = await this.prereqRepo.find({
//       where: { contentId: In(ids), prerequisiteContentId: contentId },
//       select: ['contentId', 'prerequisiteContentId'],
//     });
//     if (immediateCycle.length) {
//       throw new BadRequestException(
//         'Immediate cycle detected (a prerequisite points back to this content).',
//       );
//     }

//     // UPSERT بسيط (مع @Unique(['content', 'prerequisiteContent']))
//     const toSave = dto.items.map((i) =>
//       this.prereqRepo.create({
//         content: { id: contentId },
//         prerequisiteContent: { id: i.preId },
//         type: i.type, // PrerequisiteType Enum جاي من الـ DTO
//       }),
//     );

//     await this.prereqRepo.save(toSave);
//     return this.list(ipcId, contentId);
//   }

//   // =======================
//   //        UNASSIGN
//   // =======================
//   async unassign(
//     ipcId: number,
//     contentId: number,
//     dto: UnassignPrerequisiteDto,
//   ) {
//     const allowedIds = await this.getIpcAllowedContentIds(ipcId);

//     // تأكد إن الـ content ده تابع للـ IPC
//     if (!allowedIds.has(contentId)) {
//       throw new NotFoundException('Target content does not belong to this IPC');
//     }

//     const content = await this.contentRepo.findOne({
//       where: { id: contentId },
//     });
//     if (!content) throw new NotFoundException('Content not found');

//     const existing = await this.prereqRepo.findOne({
//       where: {
//         contentId,
//         prerequisiteContentId: dto.prerequisiteContentId,
//       },
//     });
//     if (!existing) throw new NotFoundException('Prerequisite not found');

//     await this.prereqRepo.remove(existing);
//     return { message: 'Unassigned successfully' };
//   }
// }

