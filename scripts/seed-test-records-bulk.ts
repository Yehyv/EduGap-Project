import { NestFactory } from '@nestjs/core';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';

import { RoleCategory } from '../src/common/enums/role-category.enum';

import { Language } from '../src/languages/entities/language.entity';
import { SystemRole } from '../src/system-roles/entities/system-role.entity';
import { SystemUser } from '../src/system-users/entities/system-user.entity';

import { Country } from '../src/countries/entities/country.entity';
import { City } from '../src/cities/entities/city.entity';
import { Region } from '../src/regions/entities/region.entity';
import { Institute } from '../src/institutes/entities/institute.entity';
import { InstitutePrograms } from '../src/institutes/entities/institute-programs.entity';
import { InstituteProgramCourse } from '../src/institutes/entities/institute-program-course.entity';

import { Program } from '../src/programs/entities/program.entity';
import { ProgramCourse } from '../src/programs/entities/program-course.entity';
import { CourseCategory } from '../src/course-categories/entities/course-category.entity';
import { CourseCategoriesList } from '../src/courses/entities/course-categories-list.entity';
import { Course } from '../src/courses/entities/course.entity';
import { CourseContent } from '../src/courses/entities/course-content.entity';

import { ContentCategory } from '../src/content-categories/entities/content-category.entity';
import { Content } from '../src/contents/entities/content.entity';
import { Topic } from '../src/topics/entities/topic.entity';
import { Lesson, LessonType } from '../src/lessons/entities/lesson.entity';
import { MaterialType } from '../src/lesson-materials/entities/material-type.entity';
import { LessonMaterial } from '../src/lesson-materials/entities/lesson-material.entity';
import { LessonMaterialTranslation } from '../src/lesson-materials/entities/lesson-material-translation.entity';

import { User } from '../src/users/entities/user.entity';
import { Educator } from '../src/educators/entities/educator.entity';
import { Enrollment } from '../src/enrollments/entities/enrollment.entity';
import { LessonProgress } from '../src/progress/entities/lesson-progress.entity';

import { Package as LearningPackage } from '../src/packages/entities/package.entity';
import { PackageContent } from '../src/packages/entities/package-content.entity';
import { PackageEnrollment } from '../src/package-enrollments/entities/package-enrollment.entity';

import {
  PrerequisiteContent,
  PrerequisiteType,
} from '../src/prerequiest-contents/entities/prerequiest-content.entity';

import {
  Question,
  QuestionType,
} from '../src/questions/entities/question.entity';
import { QuestionAnswerLabel } from '../src/questions/entities/question-answer.entity';

import { SavedCourse } from '../src/saved-courses/entities/saved-course.entity';
import { SavedContent } from '../src/saved-contents/entities/saved-content.entity';
import { SavedLesson } from '../src/saved-lesson/entities/saved-lesson.entity';
import { SavedPackage } from '../src/saved-packages/entities/saved-package.entity';

import { ContentReview } from '../src/content-reviews/entities/content-review.entity';
import { EducatorReview } from '../src/educator-reviews/entities/educator-review.entity';
import { LessonComment } from '../src/lesson-comments/entities/lesson-comment.entity';
import { LessonNote } from '../src/lesson-notes/entities/lesson-note.entity';
import { LessonReaction } from '../src/lesson-reactions/entities/lesson-reaction.entity';

import {
  ActivationReason,
  ActivationReasonType,
} from '../src/activation-reasons/entities/activation-reason.entity';
import { ActivationLog } from '../src/users/entities/activation-log.entity';
import { PasswordAction } from '../src/users/entities/password-action.entity';
import { UserOtp } from '../src/users-otp/entities/users-otp.entity';

import { UsersBatchUpload } from '../src/users-batch-upload/entities/users-batch-upload.entity';
import { UsersBatchUploadError } from '../src/users-batch-upload/entities/users_batch_upload_errors.entity';

import { ContactMessage } from '../src/contact-messages/entities/contact-message.entity';
import { ApplyMessage } from '../src/apply-messages/entities/apply-message.entity';

import { Specialization } from '../src/specializations/entities/specialization.entity';

import {
  Certificate,
  CertificateLanguage,
  CertificateType,
} from '../src/certificates/entities/certificate.entity';
import { CertificateContent } from '../src/certificates/entities/certificate-content.entity';
import { CertificatePackage } from '../src/certificates/entities/certificate-package.entity';

import {
  Transaction,
  TransactionType,
} from '../src/transactions/entities/transaction.entity';

const SEED_TAG = '[TEST-SEED-BULK]';
const MIN_ROWS = Number(process.env.TEST_SEED_MIN_ROWS || 10);
const PASSWORD = 'Test@123456';
const IMAGE_URL = 'https://example.com/test-seed-image.png';
const VIDEO_URL = 'https://example.com/test-seed-video.mp4';

function mustRunOnlyWhenAllowed() {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowed = process.env.ALLOW_TEST_SEED === 'true';

  if (isProduction || !allowed) {
    throw new Error(
      'Refusing to run test seed. Set ALLOW_TEST_SEED=true and never run it with NODE_ENV=production.',
    );
  }
}

function pad(index: number) {
  return String(index).padStart(2, '0');
}

function range(count = MIN_ROWS) {
  return Array.from({ length: count }, (_, index) => index + 1);
}

async function findOrCreate<T extends ObjectLiteral>(
  repo: Repository<T>,
  where: any,
  data: any,
  label: string,
): Promise<T> {
  const existing = await repo.findOne({ where } as any);

  if (existing) {
    console.log(`↻ exists: ${label}`);
    return existing;
  }

  const entity = repo.create(data as any);
  const saved = await repo.save(entity as any);
  console.log(`✓ created: ${label}`);
  return saved as T;
}

async function findOrCreateByJoinedField<T extends ObjectLiteral>(
  repo: Repository<T>,
  relationPath: string,
  joinedField: string,
  joinedValue: any,
  data: any,
  label: string,
): Promise<T> {
  const existing = await repo
    .createQueryBuilder('entity')
    .leftJoin(`entity.${relationPath}`, 'joined')
    .where(`joined.${joinedField} = :joinedValue`, { joinedValue })
    .getOne();

  if (existing) {
    console.log(`↻ exists: ${label}`);
    return existing;
  }

  const entity = repo.create(data as any);
  const saved = await repo.save(entity as any);
  console.log(`✓ created: ${label}`);
  return saved as T;
}

async function main() {
  mustRunOnlyWhenAllowed();

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const dataSource = app.get(DataSource);
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  try {
    await dataSource.transaction(async (manager) => {
      const languageRepo = manager.getRepository(Language);
      const roleRepo = manager.getRepository(SystemRole);
      const systemUserRepo = manager.getRepository(SystemUser);
      const countryRepo = manager.getRepository(Country);
      const cityRepo = manager.getRepository(City);
      const regionRepo = manager.getRepository(Region);
      const instituteRepo = manager.getRepository(Institute);
      const instituteProgramsRepo = manager.getRepository(InstitutePrograms);
      const instituteProgramCourseRepo = manager.getRepository(
        InstituteProgramCourse,
      );
      const programRepo = manager.getRepository(Program);
      const programCourseRepo = manager.getRepository(ProgramCourse);
      const courseCategoryRepo = manager.getRepository(CourseCategory);
      const courseCategoriesListRepo =
        manager.getRepository(CourseCategoriesList);
      const courseRepo = manager.getRepository(Course);
      const courseContentRepo = manager.getRepository(CourseContent);
      const contentCategoryRepo = manager.getRepository(ContentCategory);
      const contentRepo = manager.getRepository(Content);
      const topicRepo = manager.getRepository(Topic);
      const lessonRepo = manager.getRepository(Lesson);
      const materialTypeRepo = manager.getRepository(MaterialType);
      const lessonMaterialRepo = manager.getRepository(LessonMaterial);
      const lessonMaterialTranslationRepo = manager.getRepository(
        LessonMaterialTranslation,
      );
      const userRepo = manager.getRepository(User);
      const educatorRepo = manager.getRepository(Educator);
      const packageRepo = manager.getRepository(LearningPackage);
      const packageContentRepo = manager.getRepository(PackageContent);
      const packageEnrollmentRepo = manager.getRepository(PackageEnrollment);
      const enrollmentRepo = manager.getRepository(Enrollment);
      const lessonProgressRepo = manager.getRepository(LessonProgress);
      const prerequisiteRepo = manager.getRepository(PrerequisiteContent);
      const questionRepo = manager.getRepository(Question);
      const savedCourseRepo = manager.getRepository(SavedCourse);
      const savedContentRepo = manager.getRepository(SavedContent);
      const savedLessonRepo = manager.getRepository(SavedLesson);
      const savedPackageRepo = manager.getRepository(SavedPackage);
      const contentReviewRepo = manager.getRepository(ContentReview);
      const educatorReviewRepo = manager.getRepository(EducatorReview);
      const lessonCommentRepo = manager.getRepository(LessonComment);
      const lessonNoteRepo = manager.getRepository(LessonNote);
      const lessonReactionRepo = manager.getRepository(LessonReaction);
      const activationReasonRepo = manager.getRepository(ActivationReason);
      const activationLogRepo = manager.getRepository(ActivationLog);
      const passwordActionRepo = manager.getRepository(PasswordAction);
      const userOtpRepo = manager.getRepository(UserOtp);
      const batchUploadRepo = manager.getRepository(UsersBatchUpload);
      const batchUploadErrorRepo = manager.getRepository(UsersBatchUploadError);
      const contactMessageRepo = manager.getRepository(ContactMessage);
      const applyMessageRepo = manager.getRepository(ApplyMessage);
      const specializationRepo = manager.getRepository(Specialization);
      const certificateRepo = manager.getRepository(Certificate);
      const certificateContentRepo = manager.getRepository(CertificateContent);
      const certificatePackageRepo = manager.getRepository(CertificatePackage);
      const transactionRepo = manager.getRepository(Transaction);

      const languages: Language[] = [];
      languages.push(
        await findOrCreate(
          languageRepo,
          { name: 'Arabic' },
          { name: 'Arabic', isDefault: 1, isActive: 1 },
          'language: Arabic',
        ),
      );
      languages.push(
        await findOrCreate(
          languageRepo,
          { name: 'English' },
          { name: 'English', isDefault: 0, isActive: 1 },
          'language: English',
        ),
      );
      for (const i of range(Math.max(MIN_ROWS - languages.length, 0))) {
        const n = i + 2;
        languages.push(
          await findOrCreate(
            languageRepo,
            { name: `Seed Language ${pad(n)}` },
            { name: `Seed Language ${pad(n)}`, isDefault: 0, isActive: 1 },
            `language: Seed Language ${pad(n)}`,
          ),
        );
      }

      const ar = languages[0];
      const en = languages[1];

      const roleSpecs = [
        { title: 'SUPER_ADMIN', category: RoleCategory.DASHBOARD },
        { title: 'ADMIN', category: RoleCategory.DASHBOARD },
        { title: 'INST_ADMIN', category: RoleCategory.DASHBOARD },
        { title: 'STUDENT', category: RoleCategory.PORTAL },
        { title: 'EDUCATOR', category: RoleCategory.PORTAL },
        ...range(Math.max(MIN_ROWS - 5, 0)).map((i) => ({
          title: `SEED_TEST_ROLE_${pad(i)}`,
          category: RoleCategory.DASHBOARD,
        })),
      ];

      const roles: SystemRole[] = [];
      for (const spec of roleSpecs) {
        roles.push(
          await findOrCreate(
            roleRepo,
            { role_title: spec.title },
            {
              role_title: spec.title,
              role_category: spec.category,
              is_active: 1,
            },
            `role: ${spec.title}`,
          ),
        );
      }

      const superAdminRole = roles[0];
      const instAdminRole = roles[2];
      const studentRole = roles[3];
      const educatorRole = roles[4];

      const superAdmin = await findOrCreate(
        systemUserRepo,
        { email: 'seed.super.admin@edugap.test' },
        {
          full_name: 'Seed Super Admin',
          email: 'seed.super.admin@edugap.test',
          national_id: '19900000000001',
          phone_key: '020',
          phone: '1000000001',
          username: 'seed_super_admin',
          password: passwordHash,
          refresh_token: null,
          is_active: 1,
          SysUserrole: superAdminRole,
          institute: null,
        },
        'system_user: Seed Super Admin',
      );

      const countries: Country[] = [];
      const cities: City[] = [];
      const regions: Region[] = [];
      const institutes: Institute[] = [];
      const programs: Program[] = [];
      const courseCategories: CourseCategory[] = [];
      const courses: Course[] = [];
      const contentCategories: ContentCategory[] = [];
      const students: User[] = [];
      const educatorUsers: User[] = [];
      const educators: Educator[] = [];
      const prereqContents: Content[] = [];
      const contents: Content[] = [];
      const topics: Topic[] = [];
      const lessons: Lesson[] = [];
      const materialTypes: MaterialType[] = [];
      const lessonMaterials: LessonMaterial[] = [];
      const packages: LearningPackage[] = [];
      const packageEnrollments: PackageEnrollment[] = [];
      const enrollments: Enrollment[] = [];
      const activationReasons: ActivationReason[] = [];
      const batchUploads: UsersBatchUpload[] = [];

      for (const i of range()) {
        const n = pad(i);

        const country = await findOrCreateByJoinedField(
          countryRepo,
          'translations',
          'name',
          `Seed Country ${n}`,
          {
            isActive: 1,
            createdBy: superAdmin,
            translations: [
              { name: `دولة اختبار ${n}`, language: ar },
              { name: `Seed Country ${n}`, language: en },
            ],
          },
          `country: Seed Country ${n}`,
        );
        countries.push(country);

        const city = await findOrCreateByJoinedField(
          cityRepo,
          'translations',
          'name',
          `Seed City ${n}`,
          {
            isActive: 1,
            country,
            createdBy: superAdmin,
            translations: [
              { name: `مدينة اختبار ${n}`, language: ar },
              { name: `Seed City ${n}`, language: en },
            ],
          },
          `city: Seed City ${n}`,
        );
        cities.push(city);

        const region = await findOrCreateByJoinedField(
          regionRepo,
          'translations',
          'name',
          `Seed Region ${n}`,
          {
            isActive: 1,
            city,
            createdBy: superAdmin,
            translations: [
              { name: `منطقة اختبار ${n}`, language: ar },
              { name: `Seed Region ${n}`, language: en },
            ],
          },
          `region: Seed Region ${n}`,
        );
        regions.push(region);

        const institute = await findOrCreate(
          instituteRepo,
          { email: `seed.institute.${n}@edugap.test` },
          {
            logo: IMAGE_URL,
            image_profile: IMAGE_URL,
            email: `seed.institute.${n}@edugap.test`,
            phone_key: '020',
            phone: `11000000${n}`,
            is_active: 1,
            region,
            createdBy: superAdmin,
            translations: [
              {
                name: `معهد الاختبار ${n}`,
                address: `عنوان اختبار ${n} - القاهرة`,
                contactPersopnName: `مسؤول الاختبار ${n}`,
                contactPersonPostion: `مدير اختبار ${n}`,
                language: ar,
              },
              {
                name: `Seed Institute ${n}`,
                address: `Seed Address ${n} - Cairo`,
                contactPersopnName: `Seed Contact Person ${n}`,
                contactPersonPostion: `Seed Manager ${n}`,
                language: en,
              },
            ],
          },
          `institute: Seed Institute ${n}`,
        );
        institutes.push(institute);

        await findOrCreate(
          systemUserRepo,
          { email: `seed.system.user.${n}@edugap.test` },
          {
            full_name: `Seed System User ${n}`,
            email: `seed.system.user.${n}@edugap.test`,
            national_id: `198000000000${n}`,
            phone_key: '020',
            phone: `12000000${n}`,
            username: `seed_system_user_${n}`,
            password: passwordHash,
            refresh_token: null,
            is_active: 1,
            SysUserrole: i % 2 === 0 ? instAdminRole : superAdminRole,
            institute,
          },
          `system_user: Seed System User ${n}`,
        );

        const program = await findOrCreateByJoinedField(
          programRepo,
          'translations',
          'name',
          `Seed Program ${n}`,
          {
            logo: IMAGE_URL,
            isActive: 1,
            createdBy: superAdmin,
            translations: [
              {
                name: `برنامج اختبار ${n}`,
                description: `برنامج عربي اختباري رقم ${n}`,
                language: ar,
              },
              {
                name: `Seed Program ${n}`,
                description: `English seed program ${n}`,
                language: en,
              },
            ],
          },
          `program: Seed Program ${n}`,
        );
        programs.push(program);

        await findOrCreate(
          instituteProgramsRepo,
          { institute: { id: institute.id }, program: { id: program.id } },
          { institute, program, is_active: 1 },
          `institute_programs: ${n}`,
        );

        const courseCategory = await findOrCreateByJoinedField(
          courseCategoryRepo,
          'translations',
          'name',
          `Seed Course Category ${n}`,
          {
            isActive: 1,
            translations: [
              {
                name: `تصنيف كورس اختبار ${n}`,
                description: `تصنيف عربي اختباري رقم ${n}`,
                language: ar,
              },
              {
                name: `Seed Course Category ${n}`,
                description: `English seed course category ${n}`,
                language: en,
              },
            ],
          },
          `course_category: Seed Course Category ${n}`,
        );
        courseCategories.push(courseCategory);

        await findOrCreate(
          courseCategoriesListRepo,
          { category_name: `Seed Legacy Course Category ${n}` },
          {
            category_name: `Seed Legacy Course Category ${n}`,
            category_description: `${SEED_TAG} legacy category list record ${n}`,
            is_active: 1,
            added_by: superAdmin.id,
          },
          `course_categories_list: Seed Legacy Course Category ${n}`,
        );

        const course = await findOrCreateByJoinedField(
          courseRepo,
          'translations',
          'name',
          `Seed Course ${n}`,
          {
            image: IMAGE_URL,
            notes: `${SEED_TAG} bilingual course ${n}`,
            isActive: 1,
            createdBy: superAdmin,
            courseCategory,
            translations: [
              {
                name: `كورس اختبار ${n}`,
                description: `كورس عربي اختباري رقم ${n}`,
                whatToLearn: ['NestJS', 'TypeORM', 'MySQL'],
                language: ar,
              },
              {
                name: `Seed Course ${n}`,
                description: `English seed course ${n}`,
                whatToLearn: ['NestJS', 'TypeORM', 'MySQL'],
                language: en,
              },
            ],
          },
          `course: Seed Course ${n}`,
        );
        courses.push(course);

        await findOrCreate(
          programCourseRepo,
          { program: { id: program.id }, course: { id: course.id } },
          { program, course, isActive: 1 },
          `program_course: ${n}`,
        );

        await findOrCreate(
          instituteProgramCourseRepo,
          {
            institute: { id: institute.id },
            program: { id: program.id },
            course: { id: course.id },
          },
          { institute, program, course, is_active: 1 },
          `institute_program_course: ${n}`,
        );

        const contentCategory = await findOrCreateByJoinedField(
          contentCategoryRepo,
          'translations',
          'name',
          `Seed Content Category ${n}`,
          {
            is_active: 1,
            createdBy: superAdmin,
            translations: [
              {
                name: `تصنيف محتوى اختبار ${n}`,
                description: `تصنيف محتوى عربي اختباري رقم ${n}`,
                language: ar,
              },
              {
                name: `Seed Content Category ${n}`,
                description: `English seed content category ${n}`,
                language: en,
              },
            ],
          },
          `content_category: Seed Content Category ${n}`,
        );
        contentCategories.push(contentCategory);

        const student = await findOrCreate(
          userRepo,
          { email: `seed.student.${n}@edugap.test` },
          {
            full_name: `Seed Student ${n}`,
            email: `seed.student.${n}@edugap.test`,
            national_id: `299000000000${n}`,
            phone_key: '020',
            phone: `13000000${n}`,
            username: `seed_student_${n}`,
            password: passwordHash,
            is_verified: 1,
            refreshToken: null,
            verified_method: 1,
            is_active: 1,
            added_type: 0,
            studentId: 10000 + i,
            institute,
            program,
            UserRole: studentRole,
            createdBy: superAdmin,
          },
          `user: Seed Student ${n}`,
        );
        students.push(student);

        const educatorUser = await findOrCreate(
          userRepo,
          { email: `seed.educator.${n}@edugap.test` },
          {
            full_name: `Seed Educator ${n}`,
            email: `seed.educator.${n}@edugap.test`,
            national_id: `399000000000${n}`,
            phone_key: '020',
            phone: `14000000${n}`,
            username: `seed_educator_${n}`,
            password: passwordHash,
            is_verified: 1,
            refreshToken: null,
            verified_method: 1,
            is_active: 1,
            added_type: 0,
            studentId: null,
            institute,
            program,
            UserRole: educatorRole,
            createdBy: superAdmin,
          },
          `user: Seed Educator ${n}`,
        );
        educatorUsers.push(educatorUser);

        const educator = await findOrCreate(
          educatorRepo,
          { user: { id: educatorUser.id } },
          {
            title: `Seed Instructor ${n} / محاضر اختبار ${n}`,
            bio: `English: test educator ${n}. عربي: محاضر اختباري ${n}.`,
            image: IMAGE_URL,
            video_intro: VIDEO_URL,
            is_active: 1,
            user: educatorUser,
            createdBy: superAdmin,
          },
          `educator: Seed Instructor ${n}`,
        );
        educators.push(educator);

        const prereqContent = await findOrCreateByJoinedField(
          contentRepo,
          'translations',
          'name',
          `Seed Prerequisite Content ${n}`,
          {
            image: IMAGE_URL,
            level: 'Beginner',
            hasPrerequiest: 0,
            has_certificate: 1,
            is_active: 1,
            adVideo: VIDEO_URL,
            is_ai_content: 0,
            rate: 4.5,
            contentCategory,
            educator,
            createdBy: superAdmin,
            translations: [
              {
                name: `محتوى تمهيدي اختبار ${n}`,
                description: `محتوى مطلوب قبل المحتوى الأساسي رقم ${n}`,
                level_name: 'مبتدئ',
                what_to_learn: `أساسيات تمهيدية ${n}`,
                language_type: 'Arabic',
                previous_background: 'لا يوجد',
                language: ar,
              },
              {
                name: `Seed Prerequisite Content ${n}`,
                description: `Required content before the main content ${n}`,
                level_name: 'Beginner',
                what_to_learn: `Prerequisite basics ${n}`,
                language_type: 'English',
                previous_background: 'None',
                language: en,
              },
            ],
          },
          `content: Seed Prerequisite Content ${n}`,
        );
        prereqContents.push(prereqContent);

        const content = await findOrCreateByJoinedField(
          contentRepo,
          'translations',
          'name',
          `Seed Content ${n}`,
          {
            image: IMAGE_URL,
            level: 'Beginner',
            hasPrerequiest: 1,
            has_certificate: 1,
            is_active: 1,
            adVideo: VIDEO_URL,
            is_ai_content: 0,
            rate: 5,
            contentCategory,
            educator,
            createdBy: superAdmin,
            translations: [
              {
                name: `محتوى اختبار ${n}`,
                description: `محتوى عربي اختباري رقم ${n}`,
                level_name: 'مبتدئ',
                what_to_learn: `إنشاء APIs باستخدام NestJS ${n}`,
                language_type: 'Arabic',
                previous_background: 'أساسيات JavaScript',
                language: ar,
              },
              {
                name: `Seed Content ${n}`,
                description: `English seed content ${n}`,
                level_name: 'Beginner',
                what_to_learn: `Build APIs with NestJS ${n}`,
                language_type: 'English',
                previous_background: 'JavaScript basics',
                language: en,
              },
            ],
          },
          `content: Seed Content ${n}`,
        );
        contents.push(content);

        await findOrCreate(
          courseContentRepo,
          { course: { id: course.id }, content: { id: content.id } },
          { course, content, is_active: 1 },
          `course_content: main ${n}`,
        );

        await findOrCreate(
          courseContentRepo,
          { course: { id: course.id }, content: { id: prereqContent.id } },
          { course, content: prereqContent, is_active: 1 },
          `course_content: prerequisite ${n}`,
        );

        await findOrCreate(
          prerequisiteRepo,
          { contentId: content.id, prerequisiteContentId: prereqContent.id },
          {
            content,
            contentId: content.id,
            prerequisiteContent: prereqContent,
            prerequisiteContentId: prereqContent.id,
            type: PrerequisiteType.MANDATORY,
          },
          `prerequisite_content: ${n}`,
        );

        const topic = await findOrCreateByJoinedField(
          topicRepo,
          'translations',
          'name',
          `Seed Topic ${n}`,
          {
            order_id: i,
            is_active: 1,
            content,
            createdBy: superAdmin,
            translations: [
              {
                name: `موضوع اختبار ${n}`,
                description: `موضوع عربي اختباري رقم ${n}`,
                language: ar,
              },
              {
                name: `Seed Topic ${n}`,
                description: `English seed topic ${n}`,
                language: en,
              },
            ],
          },
          `topic: Seed Topic ${n}`,
        );
        topics.push(topic);

        const lesson = await findOrCreateByJoinedField(
          lessonRepo,
          'translations',
          'name',
          `Seed Lesson ${n}`,
          {
            duration: 10 + i,
            order_id: i,
            video_link: VIDEO_URL,
            image: IMAGE_URL,
            lesson_type: LessonType.LESSON,
            questions_percentage_score: 70,
            is_active: 1,
            topic,
            createdBy: superAdmin,
            translations: [
              {
                name: `درس اختبار ${n}`,
                description: `شرح عربي اختباري رقم ${n}`,
                language: ar,
              },
              {
                name: `Seed Lesson ${n}`,
                description: `English seed lesson ${n}`,
                language: en,
              },
            ],
          },
          `lesson: Seed Lesson ${n}`,
        );
        lessons.push(lesson);

        const materialType = await findOrCreate(
          materialTypeRepo,
          { type_name: `SEED_MATERIAL_TYPE_${n}` },
          {
            type_name: `SEED_MATERIAL_TYPE_${n}`,
            type_icon: 'pdf',
            is_active: 1,
            created_by: superAdmin.id,
          },
          `material_type: ${n}`,
        );
        materialTypes.push(materialType);

        const lessonMaterial = await findOrCreate(
          lessonMaterialRepo,
          { file: `https://example.com/test-seed-material-${n}.pdf` },
          {
            file: `https://example.com/test-seed-material-${n}.pdf`,
            lesson,
            materialType,
            content,
            is_active: 1,
          },
          `lesson_material: ${n}`,
        );
        lessonMaterials.push(lessonMaterial);

        await findOrCreate(
          lessonMaterialTranslationRepo,
          {
            lessonMaterial: { id: lessonMaterial.id },
            language: { id: ar.id },
          },
          {
            title: `مرفق الدرس اختبار ${n}`,
            description: `وصف عربي للمرفق ${n}`,
            lessonMaterial,
            language: ar,
          },
          `lesson_material_translation AR: ${n}`,
        );

        await findOrCreate(
          lessonMaterialTranslationRepo,
          {
            lessonMaterial: { id: lessonMaterial.id },
            language: { id: en.id },
          },
          {
            title: `Seed Lesson Material ${n}`,
            description: `English material description ${n}`,
            lessonMaterial,
            language: en,
          },
          `lesson_material_translation EN: ${n}`,
        );

        await findOrCreateByJoinedField(
          questionRepo,
          'translations',
          'title',
          `Seed question ${n}: What does NestJS mainly use?`,
          {
            type: QuestionType.MCQ,
            is_active: 1,
            lesson,
            translations: [
              {
                title: `سؤال اختبار ${n}: ما الذي يستخدمه NestJS بشكل أساسي؟`,
                language: ar,
              },
              {
                title: `Seed question ${n}: What does NestJS mainly use?`,
                language: en,
              },
            ],
            answers: [
              {
                label: QuestionAnswerLabel.A,
                is_correct: 1,
                translations: [
                  { title: `TypeScript ${n}`, language: en },
                  { title: `تايب سكريبت ${n}`, language: ar },
                ],
              },
              {
                label: QuestionAnswerLabel.B,
                is_correct: 0,
                translations: [
                  { title: `Plain CSS only ${n}`, language: en },
                  { title: `CSS فقط ${n}`, language: ar },
                ],
              },
            ],
          },
          `question + answers: ${n}`,
        );

        const pkg = await findOrCreateByJoinedField(
          packageRepo,
          'translations',
          'title',
          `Seed Package ${n}`,
          {
            image: IMAGE_URL,
            is_active: 1,
            created_by: superAdmin.id,
            createdBy: superAdmin,
            translations: [
              {
                title: `باكدج اختبار ${n}`,
                description: `باكدج عربي اختباري رقم ${n}`,
                learning_outcoms: `تعلم APIs و NestJS ${n}`,
                language: ar,
              },
              {
                title: `Seed Package ${n}`,
                description: `English seed package ${n}`,
                learning_outcoms: `Learn APIs and NestJS ${n}`,
                language: en,
              },
            ],
          },
          `package: Seed Package ${n}`,
        );
        packages.push(pkg);

        await findOrCreate(
          packageContentRepo,
          { package: { id: pkg.id }, content: { id: content.id } },
          { package: pkg, content, order_no: 1, is_active: 1 },
          `package_content: main ${n}`,
        );

        await findOrCreate(
          packageContentRepo,
          { package: { id: pkg.id }, content: { id: prereqContent.id } },
          { package: pkg, content: prereqContent, order_no: 0, is_active: 1 },
          `package_content: prerequisite ${n}`,
        );

        const packageEnrollment = await findOrCreate(
          packageEnrollmentRepo,
          { user: { id: student.id }, package: { id: pkg.id } },
          {
            user: student,
            package: pkg,
            status: 1,
            completed_at: new Date(),
          },
          `package_enrollment: ${n}`,
        );
        packageEnrollments.push(packageEnrollment);

        const enrollment = await findOrCreate(
          enrollmentRepo,
          { user: { id: student.id }, content: { id: content.id } },
          {
            user: student,
            content,
            status: 1,
            rating: 5,
            packageEnrollment,
          },
          `enrollment main: ${n}`,
        );
        enrollments.push(enrollment);

        await findOrCreate(
          enrollmentRepo,
          { user: { id: student.id }, content: { id: prereqContent.id } },
          {
            user: student,
            content: prereqContent,
            status: 1,
            rating: 5,
            packageEnrollment,
          },
          `enrollment prerequisite: ${n}`,
        );

        await findOrCreate(
          lessonProgressRepo,
          {
            lesson: { id: lesson.id },
            enrollment: { id: enrollment.id },
            user: { id: student.id },
          },
          {
            lesson,
            enrollment,
            user: student,
          },
          `lesson_progress: ${n}`,
        );

        await findOrCreate(
          savedCourseRepo,
          { user: { id: student.id }, course: { id: course.id } },
          { user: student, course },
          `saved_course: ${n}`,
        );

        await findOrCreate(
          savedContentRepo,
          { user: { id: student.id }, content: { id: content.id } },
          { user: student, content },
          `saved_content: ${n}`,
        );

        await findOrCreate(
          savedLessonRepo,
          {
            user: { id: student.id },
            lesson: { id: lesson.id },
            content: { id: content.id },
          },
          { user: student, lesson, content },
          `saved_lesson: ${n}`,
        );

        await findOrCreate(
          savedPackageRepo,
          { user: { id: student.id }, package: { id: pkg.id } },
          { user: student, package: pkg },
          `saved_package: ${n}`,
        );

        await findOrCreate(
          contentReviewRepo,
          { user: { id: student.id }, content: { id: content.id } },
          {
            user: student,
            content,
            review: `English: great content ${n}. عربي: محتوى ممتاز للاختبار ${n}.`,
          },
          `content_review: ${n}`,
        );

        await findOrCreate(
          educatorReviewRepo,
          {
            userId: student.id,
            educatorId: educator.id,
            contentId: content.id,
          },
          {
            userId: student.id,
            educatorId: educator.id,
            contentId: content.id,
            user: student,
            educator,
            content,
            rating: 5,
            review: `English: excellent instructor ${n}. عربي: محاضر ممتاز ${n}.`,
          },
          `educator_review: ${n}`,
        );

        await findOrCreate(
          lessonCommentRepo,
          { user: { id: student.id }, lesson: { id: lesson.id } },
          {
            user: student,
            lesson,
            comment: `English: useful lesson ${n}. عربي: درس مفيد للاختبار ${n}.`,
          },
          `lesson_comment: ${n}`,
        );

        await findOrCreate(
          lessonNoteRepo,
          {
            user: { id: student.id },
            lesson: { id: lesson.id },
            content: { id: content.id },
          },
          {
            user: student,
            lesson,
            content,
            notes: `English: remember providers and modules ${n}. عربي: راجع providers و modules ${n}.`,
          },
          `lesson_note: ${n}`,
        );

        await findOrCreate(
          lessonReactionRepo,
          { user: { id: student.id }, lesson: { id: lesson.id } },
          { user: student, lesson, reaction: 1 },
          `lesson_reaction: ${n}`,
        );

        const activationReason = await findOrCreate(
          activationReasonRepo,
          {
            type: i % 2 === 0 ? ActivationReasonType.ACTIVE : ActivationReasonType.INACTIVE,
            notes: `${SEED_TAG} activation reason ${n}`,
          },
          {
            type: i % 2 === 0 ? ActivationReasonType.ACTIVE : ActivationReasonType.INACTIVE,
            notes: `${SEED_TAG} activation reason ${n}`,
            is_active: 1,
            translations: [
              { reason: `سبب تفعيل/تعطيل اختباري ${n}`, language: ar },
              { reason: `Seed activation reason ${n}`, language: en },
            ],
          },
          `activation_reason: ${n}`,
        );
        activationReasons.push(activationReason);

        await findOrCreate(
          activationLogRepo,
          {
            user: { id: student.id },
            activationReason: { id: activationReason.id },
          },
          {
            reason: `Seed activation reason ${n} / سبب تفعيل أو تعطيل اختباري ${n}`,
            activationReason,
            action: i % 2 === 0,
            note: `${SEED_TAG} activation log ${n}`,
            user: student,
            systemUser: superAdmin,
          },
          `activation_log: ${n}`,
        );

        await findOrCreate(
          passwordActionRepo,
          { user: { id: student.id }, action: `SEED_RESET_WITH_OTP_${n}` },
          { user: student, action: `SEED_RESET_WITH_OTP_${n}` },
          `password_action: ${n}`,
        );

        await findOrCreate(
          userOtpRepo,
          { challengeId: `00000000-0000-4000-8000-0000000000${n}` },
          {
            code: `${100000 + i}`,
            expiresAt: new Date(Date.now() + 1000 * 60 * 30),
            isUsed: false,
            challengeId: `00000000-0000-4000-8000-0000000000${n}`,
            purpose: 'RESET_PASSWORD',
            user: student,
          },
          `user_otp: ${n}`,
        );

        const batchUpload = await findOrCreate(
          batchUploadRepo,
          { originalFileName: `seed-students-template-${n}.xlsx` },
          {
            createdBy: superAdmin,
            originalFileName: `seed-students-template-${n}.xlsx`,
            totalRows: 2,
            insertedRows: 1,
            ignoredRows: 1,
            status: 'PARTIAL',
          },
          `users_batch_upload: ${n}`,
        );
        batchUploads.push(batchUpload);

        await findOrCreate(
          batchUploadErrorRepo,
          { batchUpload: { id: batchUpload.id }, rowNumber: 2 },
          {
            batchUpload,
            rowNumber: 2,
            fieldName: 'email',
            errorType: 'DUPLICATE_IN_FILE',
            errorMessage: `English: duplicate email ${n}. عربي: البريد الإلكتروني مكرر ${n}.`,
            rowData: {
              full_name: `Duplicate Seed Student ${n}`,
              email: `seed.student.${n}@edugap.test`,
            },
          },
          `users_batch_upload_error: ${n}`,
        );

        await findOrCreate(
          contactMessageRepo,
          {
            email: `seed.contact.${n}@edugap.test`,
            subject: `${SEED_TAG} Contact ${n}`,
          },
          {
            full_name: `Seed Contact User ${n}`,
            email: `seed.contact.${n}@edugap.test`,
            phone_number: `15000000${n}`,
            subject: `${SEED_TAG} Contact ${n}`,
            message: `English: test contact message ${n}. عربي: رسالة تواصل اختبارية ${n}.`,
            user: student,
          },
          `contact_message: ${n}`,
        );

        await findOrCreate(
          applyMessageRepo,
          { email_address: `seed.apply.${n}@edugap.test` },
          {
            institute_name: `Seed Apply Institute ${n}`,
            contact_person: `Seed Apply Contact ${n}`,
            email_address: `seed.apply.${n}@edugap.test`,
            phone_number: `16000000${n}`,
            about_your_institute: `English: application test ${n}. عربي: طلب انضمام اختباري للمعهد ${n}.`,
          },
          `apply_message: ${n}`,
        );

        await findOrCreateByJoinedField(
          specializationRepo,
          'translations',
          'title',
          `Seed Specialization ${n}`,
          {
            isActive: 1,
            createdBy: superAdmin.id,
            translations: [
              { title: `تخصص اختبار ${n}`, language: ar },
              { title: `Seed Specialization ${n}`, language: en },
            ],
          },
          `specialization: ${n}`,
        );

        const contentCertificate = await findOrCreate(
          certificateRepo,
          { serialNumber: `TEST-CONTENT-AR-${n}` },
          {
            serialNumber: `TEST-CONTENT-AR-${n}`,
            type: CertificateType.CONTENT,
            language: CertificateLanguage.AR,
            user: student,
            title: `محتوى اختبار ${n}`,
            userCertificateName: `Seed Student ${n}`,
            issueDate: new Date(),
            hours: 10 + i,
          },
          `certificate content AR: ${n}`,
        );

        await findOrCreate(
          certificateContentRepo,
          {
            certificate: { id: contentCertificate.id },
            content: { id: content.id },
          },
          { certificate: contentCertificate, content },
          `certificate_content: ${n}`,
        );

        const packageCertificate = await findOrCreate(
          certificateRepo,
          { serialNumber: `TEST-PACKAGE-EN-${n}` },
          {
            serialNumber: `TEST-PACKAGE-EN-${n}`,
            type: CertificateType.PACKAGE,
            language: CertificateLanguage.EN,
            user: student,
            title: `Seed Package ${n}`,
            userCertificateName: `Seed Student ${n}`,
            issueDate: new Date(),
            hours: 20 + i,
          },
          `certificate package EN: ${n}`,
        );

        await findOrCreate(
          certificatePackageRepo,
          {
            certificate: { id: packageCertificate.id },
            package: { id: pkg.id },
          },
          {
            certificate: packageCertificate,
            package: pkg,
            packageContent: JSON.stringify([
              { contentId: prereqContent.id, title: `Seed Prerequisite Content ${n}` },
              { contentId: content.id, title: `Seed Content ${n}` },
            ]),
          },
          `certificate_package: ${n}`,
        );

        await findOrCreate(
          transactionRepo,
          {
            table_name: 'seed_test_records_bulk',
            trans_type: TransactionType.CREATE,
            record_id: i,
          },
          {
            table_name: 'seed_test_records_bulk',
            trans_type: TransactionType.CREATE,
            record_id: i,
            json_file: JSON.stringify({
              tag: SEED_TAG,
              index: i,
              message: `English: test seed row ${n}. عربي: صف اختبار رقم ${n}.`,
            }),
            createdBy: superAdmin,
          },
          `transaction: ${n}`,
        );
      }

      // Keep these arrays referenced for strict linters and future debug.
      void countries;
      void cities;
      void regions;
      void institutes;
      void programs;
      void courseCategories;
      void courses;
      void contentCategories;
      void students;
      void educatorUsers;
      void educators;
      void prereqContents;
      void contents;
      void topics;
      void lessons;
      void materialTypes;
      void lessonMaterials;
      void packages;
      void packageEnrollments;
      void enrollments;
      void activationReasons;
      void batchUploads;
    });

    console.log('\n✅ Bulk seed transaction completed successfully.');
    console.log(`Minimum target per table: ${MIN_ROWS}`);
    console.log(`Login test student 01: seed.student.01@edugap.test / ${PASSWORD}`);
    console.log(`System admin: seed.super.admin@edugap.test / ${PASSWORD}`);

    const belowTargetTables: string[] = [];
    const tableCounts: Array<{ table: string; count: number }> = [];

    for (const meta of dataSource.entityMetadatas) {
      const count = await dataSource.manager.count(meta.target as any);
      tableCounts.push({ table: meta.tableName, count });
      if (count < MIN_ROWS) belowTargetTables.push(`${meta.tableName}: ${count}`);
    }

    tableCounts.sort((a, b) => a.table.localeCompare(b.table));
    console.table(tableCounts);

    if (belowTargetTables.length) {
      console.warn(`\n⚠️ Tables below ${MIN_ROWS} rows:`);
      console.warn(belowTargetTables.join(', '));
      console.warn(
        'Note: classes without @Entity(), like Auth/Dashboard/Progress/Search/SystemAuth, are not database tables.',
      );
    } else {
      console.log(
        `\n✅ Every loaded TypeORM entity table has at least ${MIN_ROWS} rows.`,
      );
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('❌ Bulk test seed failed:');
  console.error(error);
  process.exit(1);
});
