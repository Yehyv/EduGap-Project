import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { User } from 'src/users/entities/user.entity';
import { Content } from 'src/contents/entities/content.entity';
import { CourseContent } from 'src/courses/entities/course-content.entity';
import { InstituteProgramCourse } from 'src/institutes/entities/institute-program-course.entity';
import { RateEnrollmentDto } from './dto/create-enrollment.dto';
import {
  PrerequisiteContent,
  PrerequisiteType,
} from 'src/prerequiest-contents/entities/prerequiest-content.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
    @InjectRepository(CourseContent)
    private readonly courseContentRepo: Repository<CourseContent>,
    @InjectRepository(InstituteProgramCourse)
    private readonly ipcRepo: Repository<InstituteProgramCourse>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(PrerequisiteContent)
    private readonly prereqRepo: Repository<PrerequisiteContent>,
  ) {}

  /**
   * Enroll: status=0 (in progress), rating=0
   * مع تحقق الـ multi-tenant عبر IPC
   */
  async enrollStudentContent(
    contentId: number,
    userId: number,
    userInstituteId: number,
  ) {
    console.log('=== START enrollStudentContent ===');
    console.log('contentId:', contentId);
    console.log('userId:', userId);
    console.log('userInstituteId:', userInstituteId);

    // ✅ التحقق من المستخدم
    console.log('🔍 Step 1: Finding user...');
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['institute'],
    });
    if (!user) {
      console.log('❌ User not found');
      throw new NotFoundException('User not found');
    }
    console.log('✅ User found:', user.id);

    // ✅ التحقق من المحتوى
    console.log('🔍 Step 2: Finding content...');
    const content = await this.contentRepo.findOne({
      where: { id: contentId },
    });
    if (!content) {
      console.log('❌ Content not found');
      throw new NotFoundException(`Content ${contentId} not found`);
    }
    console.log('✅ Content found:', content.id);
    console.log('Content hasPrerequiest:', content.hasPrerequiest);

    // ✅ تأكيد الربط بالكورسات
    console.log('🔍 Step 3: Checking course links...');
    const courseLinks = await this.courseContentRepo.find({
      where: { content: { id: contentId } },
      relations: ['course'],
    });
    console.log('Course links found:', courseLinks.length);

    if (!courseLinks.length) {
      console.log('❌ No course links');
      throw new ForbiddenException('This content is not linked to any course');
    }
    console.log('✅ Course links OK');

    // ✅ تحقق صريح من انتماء المحتوى لمعهد الطالب
    console.log('🔍 Step 4: Checking institute permission...');
    const allowedCount = await this.ipcRepo
      .createQueryBuilder('ipc')
      .innerJoin('ipc.course', 'course')
      .innerJoin(
        CourseContent,
        'cc',
        'cc.courseId = course.id AND cc.contentId = :contentId AND cc.deleted_at IS NULL',
        { contentId },
      )
      .where('ipc.instituteId = :iid', { iid: userInstituteId })
      .andWhere('ipc.is_active != 0')
      .andWhere('ipc.deleted_at IS NULL')
      .getCount();

    console.log('Allowed count:', allowedCount);

    if (allowedCount === 0) {
      console.log('❌ Content not allowed for institute');
      throw new ForbiddenException(
        'This content does not belong to your institute',
      );
    }
    console.log('✅ Institute permission OK');

    // ❌ منع التسجيل المكرر
    console.log('🔍 Step 5: Checking existing enrollment...');
    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
    });

    if (existing) {
      console.log('❌ Already enrolled:', existing.id);
      throw new BadRequestException('You are already enrolled in this content');
    }
    console.log('✅ No existing enrollment');

    // 🔎 فحص الـ prerequisites لو مطلوبة
    console.log('🔍 Step 6: Checking prerequisites...');
    const hasPrereq =
      Number(content.hasPrerequiest ?? content['has_prerequiest']) === 1;
    console.log('hasPrereq:', hasPrereq);
    console.log('content.hasPrerequiest value:', content.hasPrerequiest);
    console.log('content[has_prerequiest] value:', content['has_prerequiest']);

    if (hasPrereq) {
      console.log('🔍 Step 6a: Fetching mandatory prerequisites...');

      // جرب الطريقتين
      const mandatory1 = await this.prereqRepo.find({
        where: { contentId: contentId, type: PrerequisiteType.MANDATORY },
        relations: ['prerequisiteContent', 'prerequisiteContent.translations'],
        order: { id: 'ASC' },
      });

      console.log('Mandatory prerequisites (method 1):', mandatory1.length);
      console.log('Full data:', JSON.stringify(mandatory1, null, 2));

      // جرب بدون type
      const allPrereqs = await this.prereqRepo.find({
        where: { contentId: contentId },
        relations: ['prerequisiteContent', 'prerequisiteContent.translations'],
        order: { id: 'ASC' },
      });

      console.log('All prerequisites (no type filter):', allPrereqs.length);
      console.log('Full data:', JSON.stringify(allPrereqs, null, 2));

      // استخدم mandatory1 للمعالجة
      const mandatory = mandatory1;

      if (mandatory.length > 0) {
        console.log('🔍 Step 6b: Checking completed prerequisites...');

        const prereqIds = mandatory
          .map((m) => m.prerequisiteContentId)
          .filter((x) => x != null);

        console.log('Required prerequisite IDs:', prereqIds);

        if (prereqIds.length > 0) {
          const completedCount = await this.enrollmentRepo
            .createQueryBuilder('en')
            .where('en.userId = :uid', { uid: userId })
            .andWhere('en.status = 1')
            .andWhere('en.contentId IN (:...ids)', { ids: prereqIds })
            .getCount();

          console.log('Completed count:', completedCount);
          console.log('Required count:', prereqIds.length);

          if (completedCount !== prereqIds.length) {
            console.log('❌ Prerequisites not completed');

            const doneRows = await this.enrollmentRepo
              .createQueryBuilder('en')
              .select('en.contentId', 'cid')
              .where('en.userId = :uid', { uid: userId })
              .andWhere('en.status = 1')
              .andWhere('en.contentId IN (:...ids)', { ids: prereqIds })
              .getRawMany<{ cid: number }>();

            const doneSet = new Set(doneRows.map((r) => Number(r.cid)));
            console.log('Completed IDs:', Array.from(doneSet));

            const missing = mandatory.filter((m) => {
              return !doneSet.has(Number(m.prerequisiteContentId));
            });

            console.log('Missing prerequisites:', missing.length);

            throw new ForbiddenException({
              message: 'يرجي اتمام الدورات المطلوبة',
              required: missing.map((m) => ({
                id: m.prerequisiteContentId,
                type: m.type,
                name: m?.prerequisiteContent?.translations?.[0]?.name ?? null,
              })),
            });
          }

          console.log('✅ All prerequisites completed');
        }
      } else {
        console.log(
          '⚠️ No mandatory prerequisites found (but hasPrerequiest=1)',
        );
      }
    } else {
      console.log('⚠️ Content has no prerequisites requirement');
    }

    // ✅ إنشاء التسجيل
    console.log('🔍 Step 7: Creating enrollment...');
    const enrollment = this.enrollmentRepo.create({
      user,
      content,
      status: 0,
      rating: 0,
    });

    const saved = await this.enrollmentRepo.save(enrollment);
    console.log('✅ Enrollment created:', saved.id);
    console.log('=== END enrollStudentContent ===');

    return saved;
  }
  /**
   * Unenroll
   */
  async unenrollStudentContent(contentId: number, userId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    await this.enrollmentRepo.remove(enrollment);
    return { message: 'Unenrolled successfully' };
  }

  /**
   * الطالب يقيّم محتواه بعد التسجيل
   * - يسمح بالتقييم أو تعديل التقييم
   * - أنت لاحقًا في المتوسط تجاهل 0
   */
  async rateContent(contentId: number, userId: number, dto: RateEnrollmentDto) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.rating = dto.rating; // 1..5
    return this.enrollmentRepo.save(enrollment);
  }

  async getUserRate(contentId: number, userId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
      select: ['id', 'rating', 'status'],
    });

    if (!enrollment) {
      // مش متسجّل
      return { rating: 0, enrolled: false, status: null as number | null };
    }

    return {
      rating: enrollment.rating ?? 0,
    };
  }

  /**
   * هل المستخدم مسجل؟
   */
  async isUserEnrolled(contentId: number, userId: number) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { content: { id: contentId }, user: { id: userId } },
    });
    return !!enrollment;
  }

  /**
   * كل تسجيلات المستخدم (ممكن تسيبها زي ما هي عندك، أضفتها للاكتمال)
   */
  async getUserEnrollments(userId: number) {
    return this.enrollmentRepo.find({
      where: { user: { id: userId } },
      relations: ['content', 'content.translations'],
      order: { id: 'DESC' },
    });
  }

  /**
   * من مسجل في هذا المحتوى
   */
  async getContentEnrollments(contentId: number) {
    return this.enrollmentRepo.find({
      where: { content: { id: contentId } },
      relations: ['user'],
    });
  }
}
