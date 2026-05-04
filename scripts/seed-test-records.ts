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

const SEED_TAG = '[TEST-SEED]';
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

      // 1) Languages / اللغات
      const ar = await findOrCreate(
        languageRepo,
        { name: 'Arabic' },
        { name: 'Arabic', isDefault: 1, isActive: 1 },
        'language: Arabic',
      );

      const en = await findOrCreate(
        languageRepo,
        { name: 'English' },
        { name: 'English', isDefault: 0, isActive: 1 },
        'language: English',
      );

      // 2) Roles / الأدوار
      const superAdminRole = await findOrCreate(
        roleRepo,
        { role_title: 'SUPER_ADMIN' },
        {
          role_title: 'SUPER_ADMIN',
          role_category: RoleCategory.DASHBOARD,
          is_active: 1,
        },
        'role: SUPER_ADMIN',
      );

      const adminRole = await findOrCreate(
        roleRepo,
        { role_title: 'ADMIN' },
        {
          role_title: 'ADMIN',
          role_category: RoleCategory.DASHBOARD,
          is_active: 1,
        },
        'role: ADMIN',
      );

      const instAdminRole = await findOrCreate(
        roleRepo,
        { role_title: 'INST_ADMIN' },
        {
          role_title: 'INST_ADMIN',
          role_category: RoleCategory.DASHBOARD,
          is_active: 1,
        },
        'role: INST_ADMIN',
      );

      const studentRole = await findOrCreate(
        roleRepo,
        { role_title: 'STUDENT' },
        {
          role_title: 'STUDENT',
          role_category: RoleCategory.PORTAL,
          is_active: 1,
        },
        'role: STUDENT',
      );

      const educatorRole = await findOrCreate(
        roleRepo,
        { role_title: 'EDUCATOR' },
        {
          role_title: 'EDUCATOR',
          role_category: RoleCategory.PORTAL,
          is_active: 1,
        },
        'role: EDUCATOR',
      );

      // 3) Main system user / مستخدم سيستم رئيسي
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

      // 4) Geography / الدولة والمدينة والمنطقة
      const country = await findOrCreateByJoinedField(
        countryRepo,
        'translations',
        'name',
        'Seed Egypt',
        {
          isActive: 1,
          createdBy: superAdmin,
          translations: [
            { name: 'مصر - اختبار', language: ar },
            { name: 'Seed Egypt', language: en },
          ],
        },
        'country: Seed Egypt',
      );

      const city = await findOrCreateByJoinedField(
        cityRepo,
        'translations',
        'name',
        'Seed Cairo',
        {
          isActive: 1,
          country,
          createdBy: superAdmin,
          translations: [
            { name: 'القاهرة - اختبار', language: ar },
            { name: 'Seed Cairo', language: en },
          ],
        },
        'city: Seed Cairo',
      );

      const region = await findOrCreateByJoinedField(
        regionRepo,
        'translations',
        'name',
        'Seed Nasr City',
        {
          isActive: 1,
          city,
          createdBy: superAdmin,
          translations: [
            { name: 'مدينة نصر - اختبار', language: ar },
            { name: 'Seed Nasr City', language: en },
          ],
        },
        'region: Seed Nasr City',
      );

      // 5) Institute / المعهد
      const institute = await findOrCreate(
        instituteRepo,
        { email: 'seed.institute@edugap.test' },
        {
          logo: IMAGE_URL,
          image_profile: IMAGE_URL,
          email: 'seed.institute@edugap.test',
          phone_key: '020',
          phone: '1000000002',
          is_active: 1,
          region,
          createdBy: superAdmin,
          translations: [
            {
              name: 'معهد الاختبار',
              address: 'عنوان اختبار - القاهرة',
              contactPersopnName: 'مسؤول الاختبار',
              contactPersonPostion: 'مدير اختبار',
              language: ar,
            },
            {
              name: 'Test Institute',
              address: 'Seed Address - Cairo',
              contactPersopnName: 'Seed Contact Person',
              contactPersonPostion: 'Seed Manager',
              language: en,
            },
          ],
        },
        'institute: Test Institute',
      );

      if (!superAdmin.institute) {
        await systemUserRepo.update(
          { id: superAdmin.id } as any,
          { institute } as any,
        );
      }

      const instAdmin = await findOrCreate(
        systemUserRepo,
        { email: 'seed.inst.admin@edugap.test' },
        {
          full_name: 'Seed Institute Admin',
          email: 'seed.inst.admin@edugap.test',
          national_id: '19900000000002',
          phone_key: '020',
          phone: '1000000003',
          username: 'seed_inst_admin',
          password: passwordHash,
          refresh_token: null,
          is_active: 1,
          SysUserrole: instAdminRole,
          institute,
        },
        'system_user: Seed Institute Admin',
      );

      // Prevent eslint no-unused-vars when you want to keep this seeded role.
      void adminRole;
      void instAdmin;

      // 6) Programs / البرامج
      const program = await findOrCreateByJoinedField(
        programRepo,
        'translations',
        'name',
        'Seed Full Stack Program',
        {
          logo: IMAGE_URL,
          isActive: 1,
          createdBy: superAdmin,
          translations: [
            {
              name: 'برنامج فل ستاك - اختبار',
              description: 'برنامج اختباري لتجربة البيانات',
              language: ar,
            },
            {
              name: 'Seed Full Stack Program',
              description: 'Test program for seed data',
              language: en,
            },
          ],
        },
        'program: Seed Full Stack Program',
      );

      await findOrCreate(
        instituteProgramsRepo,
        { institute: { id: institute.id }, program: { id: program.id } },
        { institute, program, is_active: 1 },
        'institute_programs: institute + program',
      );

      // 7) Course categories / تصنيفات الكورسات
      const courseCategory = await findOrCreateByJoinedField(
        courseCategoryRepo,
        'translations',
        'name',
        'Seed Backend Category',
        {
          isActive: 1,
          translations: [
            {
              name: 'تصنيف باك إند - اختبار',
              description: 'تصنيف عربي اختباري',
              language: ar,
            },
            {
              name: 'Seed Backend Category',
              description: 'English seed course category',
              language: en,
            },
          ],
        },
        'course_category: Seed Backend Category',
      );

      await findOrCreate(
        courseCategoriesListRepo,
        { category_name: 'Seed Legacy Course Category' },
        {
          category_name: 'Seed Legacy Course Category',
          category_description: `${SEED_TAG} legacy category list record`,
          is_active: 1,
          added_by: superAdmin.id,
        },
        'course_categories_list: Seed Legacy Course Category',
      );

      const course = await findOrCreateByJoinedField(
        courseRepo,
        'translations',
        'name',
        'Seed NestJS Course',
        {
          image: IMAGE_URL,
          notes: `${SEED_TAG} bilingual course`,
          isActive: 1,
          createdBy: superAdmin,
          courseCategory,
          translations: [
            {
              name: 'كورس NestJS - اختبار',
              description: 'كورس اختباري باللغة العربية',
              whatToLearn: ['NestJS', 'TypeORM', 'MySQL'],
              language: ar,
            },
            {
              name: 'Seed NestJS Course',
              description: 'English test course',
              whatToLearn: ['NestJS', 'TypeORM', 'MySQL'],
              language: en,
            },
          ],
        },
        'course: Seed NestJS Course',
      );

      await findOrCreate(
        programCourseRepo,
        { program: { id: program.id }, course: { id: course.id } },
        { program, course, isActive: 1 },
        'program_course: program + course',
      );

      await findOrCreate(
        instituteProgramCourseRepo,
        {
          institute: { id: institute.id },
          program: { id: program.id },
          course: { id: course.id },
        },
        { institute, program, course, is_active: 1 },
        'institute_program_course: institute + program + course',
      );

      // 8) Content category / تصنيف المحتوى
      const contentCategory = await findOrCreateByJoinedField(
        contentCategoryRepo,
        'translations',
        'name',
        'Seed Web Development Content Category',
        {
          is_active: 1,
          createdBy: superAdmin,
          translations: [
            {
              name: 'تصنيف تطوير الويب - اختبار',
              description: 'تصنيف محتوى عربي اختباري',
              language: ar,
            },
            {
              name: 'Seed Web Development Content Category',
              description: 'English seed content category',
              language: en,
            },
          ],
        },
        'content_category: Seed Web Development Content Category',
      );

      // 9) Portal users + educator / مستخدمي البوابة والمحاضر
      const student = await findOrCreate(
        userRepo,
        { email: 'seed.student@edugap.test' },
        {
          full_name: 'Seed Student',
          email: 'seed.student@edugap.test',
          national_id: '29900000000001',
          phone_key: '020',
          phone: '1000000004',
          username: 'seed_student',
          password: passwordHash,
          is_verified: 1,
          refreshToken: null,
          verified_method: 1,
          is_active: 1,
          added_type: 0,
          studentId: 10001,
          institute,
          program,
          UserRole: studentRole,
          createdBy: superAdmin,
        },
        'user: Seed Student',
      );

      const educatorUser = await findOrCreate(
        userRepo,
        { email: 'seed.educator@edugap.test' },
        {
          full_name: 'Seed Educator',
          email: 'seed.educator@edugap.test',
          national_id: '29900000000002',
          phone_key: '020',
          phone: '1000000005',
          username: 'seed_educator',
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
        'user: Seed Educator',
      );

      const educator = await findOrCreate(
        educatorRepo,
        { user: { id: educatorUser.id } },
        {
          title: 'Seed Instructor / محاضر اختبار',
          bio: 'English: test educator. عربي: محاضر اختباري.',
          image: IMAGE_URL,
          video_intro: VIDEO_URL,
          is_active: 1,
          user: educatorUser,
          createdBy: superAdmin,
        },
        'educator: Seed Instructor',
      );

      // 10) Contents / المحتويات
      const prereqContent = await findOrCreateByJoinedField(
        contentRepo,
        'translations',
        'name',
        'Seed Prerequisite Content',
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
              name: 'محتوى تمهيدي - اختبار',
              description: 'محتوى مطلوب قبل المحتوى الأساسي',
              level_name: 'مبتدئ',
              what_to_learn: 'أساسيات تمهيدية',
              language_type: 'Arabic',
              previous_background: 'لا يوجد',
              language: ar,
            },
            {
              name: 'Seed Prerequisite Content',
              description: 'Required content before the main content',
              level_name: 'Beginner',
              what_to_learn: 'Prerequisite basics',
              language_type: 'English',
              previous_background: 'None',
              language: en,
            },
          ],
        },
        'content: Seed Prerequisite Content',
      );

      const content = await findOrCreateByJoinedField(
        contentRepo,
        'translations',
        'name',
        'Seed NestJS Content',
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
              name: 'محتوى NestJS - اختبار',
              description: 'محتوى عربي اختباري',
              level_name: 'مبتدئ',
              what_to_learn: 'إنشاء APIs باستخدام NestJS',
              language_type: 'Arabic',
              previous_background: 'أساسيات JavaScript',
              language: ar,
            },
            {
              name: 'Seed NestJS Content',
              description: 'English seed content',
              level_name: 'Beginner',
              what_to_learn: 'Build APIs with NestJS',
              language_type: 'English',
              previous_background: 'JavaScript basics',
              language: en,
            },
          ],
        },
        'content: Seed NestJS Content',
      );

      await findOrCreate(
        courseContentRepo,
        { course: { id: course.id }, content: { id: content.id } },
        { course, content, is_active: 1 },
        'course_content: course + main content',
      );

      await findOrCreate(
        courseContentRepo,
        { course: { id: course.id }, content: { id: prereqContent.id } },
        { course, content: prereqContent, is_active: 1 },
        'course_content: course + prerequisite content',
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
        'prerequisite_content: main content requires prerequisite content',
      );

      // 11) Topic + lesson / موضوع ودرس
      const topic = await findOrCreateByJoinedField(
        topicRepo,
        'translations',
        'name',
        'Seed NestJS Basics Topic',
        {
          order_id: 1,
          is_active: 1,
          content,
          createdBy: superAdmin,
          translations: [
            {
              name: 'أساسيات NestJS - اختبار',
              description: 'موضوع عربي اختباري',
              language: ar,
            },
            {
              name: 'Seed NestJS Basics Topic',
              description: 'English seed topic',
              language: en,
            },
          ],
        },
        'topic: Seed NestJS Basics Topic',
      );

      const lesson = await findOrCreateByJoinedField(
        lessonRepo,
        'translations',
        'name',
        'Seed First Lesson',
        {
          duration: 12.5,
          order_id: 1,
          video_link: VIDEO_URL,
          image: IMAGE_URL,
          lesson_type: LessonType.LESSON,
          questions_percentage_score: 70,
          is_active: 1,
          topic,
          createdBy: superAdmin,
          translations: [
            {
              name: 'الدرس الأول - اختبار',
              description: 'شرح عربي اختباري',
              language: ar,
            },
            {
              name: 'Seed First Lesson',
              description: 'English seed lesson',
              language: en,
            },
          ],
        },
        'lesson: Seed First Lesson',
      );

      const materialType = await findOrCreate(
        materialTypeRepo,
        { type_name: 'PDF' },
        {
          type_name: 'PDF',
          type_icon: 'pdf',
          is_active: 1,
          created_by: superAdmin.id,
        },
        'material_type: PDF',
      );

      const lessonMaterial = await findOrCreate(
        lessonMaterialRepo,
        { file: 'https://example.com/test-seed-material.pdf' },
        {
          file: 'https://example.com/test-seed-material.pdf',
          lesson,
          materialType,
          content,
          is_active: 1,
        },
        'lesson_material: test PDF',
      );

      await findOrCreate(
        lessonMaterialTranslationRepo,
        { lessonMaterial: { id: lessonMaterial.id }, language: { id: ar.id } },
        {
          title: 'مرفق الدرس - اختبار',
          description: 'وصف عربي للمرفق',
          lessonMaterial,
          language: ar,
        },
        'lesson_material_translation: AR',
      );

      await findOrCreate(
        lessonMaterialTranslationRepo,
        { lessonMaterial: { id: lessonMaterial.id }, language: { id: en.id } },
        {
          title: 'Seed Lesson Material',
          description: 'English material description',
          lessonMaterial,
          language: en,
        },
        'lesson_material_translation: EN',
      );

      // 12) Questions / الأسئلة
      const question = await findOrCreateByJoinedField(
        questionRepo,
        'translations',
        'title',
        'What does NestJS mainly use?',
        {
          type: QuestionType.MCQ,
          is_active: 1,
          lesson,
          translations: [
            { title: 'ما الذي يستخدمه NestJS بشكل أساسي؟', language: ar },
            { title: 'What does NestJS mainly use?', language: en },
          ],
          answers: [
            {
              label: QuestionAnswerLabel.A,
              is_correct: 1,
              translations: [
                { title: 'TypeScript', language: en },
                { title: 'تايب سكريبت', language: ar },
              ],
            },
            {
              label: QuestionAnswerLabel.B,
              is_correct: 0,
              translations: [
                { title: 'Plain CSS only', language: en },
                { title: 'CSS فقط', language: ar },
              ],
            },
          ],
        },
        'question + answers: Seed NestJS MCQ',
      );

      void question;

      // 13) Package / الباكدج
      const pkg = await findOrCreateByJoinedField(
        packageRepo,
        'translations',
        'title',
        'Seed Backend Package',
        {
          image: IMAGE_URL,
          is_active: 1,
          created_by: superAdmin.id,
          createdBy: superAdmin,
          translations: [
            {
              title: 'باكدج الباك إند - اختبار',
              description: 'باكدج عربي اختباري',
              learning_outcoms: 'تعلم APIs و NestJS',
              language: ar,
            },
            {
              title: 'Seed Backend Package',
              description: 'English seed package',
              learning_outcoms: 'Learn APIs and NestJS',
              language: en,
            },
          ],
        },
        'package: Seed Backend Package',
      );

      await findOrCreate(
        packageContentRepo,
        { package: { id: pkg.id }, content: { id: content.id } },
        { package: pkg, content, order_no: 1, is_active: 1 },
        'package_content: package + main content',
      );

      await findOrCreate(
        packageContentRepo,
        { package: { id: pkg.id }, content: { id: prereqContent.id } },
        { package: pkg, content: prereqContent, order_no: 0, is_active: 1 },
        'package_content: package + prerequisite content',
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
        'package_enrollment: student + package',
      );

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
        'enrollment: student + main content',
      );

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
        'enrollment: student + prerequisite content',
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
        'lesson_progress: student + lesson + enrollment',
      );

      // 14) Saved items / العناصر المحفوظة
      await findOrCreate(
        savedCourseRepo,
        { user: { id: student.id }, course: { id: course.id } },
        { user: student, course },
        'saved_course: student + course',
      );

      await findOrCreate(
        savedContentRepo,
        { user: { id: student.id }, content: { id: content.id } },
        { user: student, content },
        'saved_content: student + content',
      );

      await findOrCreate(
        savedLessonRepo,
        {
          user: { id: student.id },
          lesson: { id: lesson.id },
          content: { id: content.id },
        },
        { user: student, lesson, content },
        'saved_lesson: student + lesson + content',
      );

      await findOrCreate(
        savedPackageRepo,
        { user: { id: student.id }, package: { id: pkg.id } },
        { user: student, package: pkg },
        'saved_package: student + package',
      );

      // 15) Reviews, comments, notes, reactions / مراجعات وتعليقات وملاحظات وتفاعلات
      await findOrCreate(
        contentReviewRepo,
        { user: { id: student.id }, content: { id: content.id } },
        {
          user: student,
          content,
          review: 'English: great content. عربي: محتوى ممتاز للاختبار.',
        },
        'content_review: student + content',
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
          review: 'English: excellent instructor. عربي: محاضر ممتاز.',
        },
        'educator_review: student + educator + content',
      );

      await findOrCreate(
        lessonCommentRepo,
        { user: { id: student.id }, lesson: { id: lesson.id } },
        {
          user: student,
          lesson,
          comment: 'English: useful lesson. عربي: درس مفيد للاختبار.',
        },
        'lesson_comment: student + lesson',
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
          notes:
            'English: remember providers and modules. عربي: راجع providers و modules.',
        },
        'lesson_note: student + lesson + content',
      );

      await findOrCreate(
        lessonReactionRepo,
        { user: { id: student.id }, lesson: { id: lesson.id } },
        { user: student, lesson, reaction: 1 },
        'lesson_reaction: like',
      );

      // 16) Activation reasons/logs + password/otp / أسباب التفعيل والسجل والباسورد والـ OTP
      const activationReason = await findOrCreate(
        activationReasonRepo,
        {
          type: ActivationReasonType.INACTIVE,
          notes: `${SEED_TAG} inactive reason`,
        },
        {
          type: ActivationReasonType.INACTIVE,
          notes: `${SEED_TAG} inactive reason`,
          is_active: 1,
          translations: [
            { reason: 'سبب تعطيل اختباري', language: ar },
            { reason: 'Seed inactive reason', language: en },
          ],
        },
        'activation_reason: inactive',
      );

      await findOrCreate(
        activationLogRepo,
        {
          user: { id: student.id },
          activationReason: { id: activationReason.id },
        },
        {
          reason: 'Seed inactive reason / سبب تعطيل اختباري',
          activationReason,
          action: false,
          note: `${SEED_TAG} activation log`,
          user: student,
          systemUser: superAdmin,
        },
        'activation_log: student inactive reason',
      );

      await findOrCreate(
        passwordActionRepo,
        { user: { id: student.id }, action: 'RESET_WITH_OTP' },
        { user: student, action: 'RESET_WITH_OTP' },
        'password_action: RESET_WITH_OTP',
      );

      await findOrCreate(
        userOtpRepo,
        { challengeId: '00000000-0000-4000-8000-000000000001' },
        {
          code: '123456',
          expiresAt: new Date(Date.now() + 1000 * 60 * 30),
          isUsed: false,
          challengeId: '00000000-0000-4000-8000-000000000001',
          purpose: 'RESET_PASSWORD',
          user: student,
        },
        'user_otp: RESET_PASSWORD',
      );

      // 17) Batch upload / رفع الطلاب بالإكسل
      const batchUpload = await findOrCreate(
        batchUploadRepo,
        { originalFileName: 'seed-students-template.xlsx' },
        {
          createdBy: superAdmin,
          originalFileName: 'seed-students-template.xlsx',
          totalRows: 2,
          insertedRows: 1,
          ignoredRows: 1,
          status: 'PARTIAL',
        },
        'users_batch_upload: seed-students-template.xlsx',
      );

      await findOrCreate(
        batchUploadErrorRepo,
        { batchUpload: { id: batchUpload.id }, rowNumber: 2 },
        {
          batchUpload,
          rowNumber: 2,
          fieldName: 'email',
          errorType: 'DUPLICATE_IN_FILE',
          errorMessage:
            'English: duplicate email. عربي: البريد الإلكتروني مكرر.',
          rowData: {
            full_name: 'Duplicate Seed Student',
            email: 'seed.student@edugap.test',
          },
        },
        'users_batch_upload_error: duplicate email',
      );

      // 18) Messages / رسائل التواصل والتقديم
      await findOrCreate(
        contactMessageRepo,
        { email: 'seed.contact@edugap.test', subject: `${SEED_TAG} Contact` },
        {
          full_name: 'Seed Contact User',
          email: 'seed.contact@edugap.test',
          phone_number: '1000000006',
          subject: `${SEED_TAG} Contact`,
          message: 'English: test contact message. عربي: رسالة تواصل اختبارية.',
          user: student,
        },
        'contact_message: seed contact',
      );

      await findOrCreate(
        applyMessageRepo,
        { email_address: 'seed.apply@edugap.test' },
        {
          institute_name: 'Seed Apply Institute',
          contact_person: 'Seed Apply Contact',
          email_address: 'seed.apply@edugap.test',
          phone_number: '1000000007',
          about_your_institute:
            'English: application test. عربي: طلب انضمام اختباري للمعهد.',
        },
        'apply_message: seed apply',
      );

      // 19) Specialization / تخصص
      await findOrCreateByJoinedField(
        specializationRepo,
        'translations',
        'title',
        'Seed Backend Specialization',
        {
          isActive: 1,
          createdBy: superAdmin.id,
          translations: [
            { title: 'تخصص باك إند - اختبار', language: ar },
            { title: 'Seed Backend Specialization', language: en },
          ],
        },
        'specialization: Seed Backend Specialization',
      );

      // 20) Certificates / الشهادات
      const contentCertificate = await findOrCreate(
        certificateRepo,
        { serialNumber: 'TEST-CONTENT-AR-0001' },
        {
          serialNumber: 'TEST-CONTENT-AR-0001',
          type: CertificateType.CONTENT,
          language: CertificateLanguage.AR,
          user: student,
          title: 'محتوى NestJS - اختبار',
          userCertificateName: 'Seed Student',
          issueDate: new Date(),
          hours: 12.5,
        },
        'certificate: content AR',
      );

      await findOrCreate(
        certificateContentRepo,
        {
          certificate: { id: contentCertificate.id },
          content: { id: content.id },
        },
        { certificate: contentCertificate, content },
        'certificate_content: content certificate link',
      );

      const packageCertificate = await findOrCreate(
        certificateRepo,
        { serialNumber: 'TEST-PACKAGE-EN-0001' },
        {
          serialNumber: 'TEST-PACKAGE-EN-0001',
          type: CertificateType.PACKAGE,
          language: CertificateLanguage.EN,
          user: student,
          title: 'Seed Backend Package',
          userCertificateName: 'Seed Student',
          issueDate: new Date(),
          hours: 25,
        },
        'certificate: package EN',
      );

      await findOrCreate(
        certificatePackageRepo,
        { certificate: { id: packageCertificate.id }, package: { id: pkg.id } },
        {
          certificate: packageCertificate,
          package: pkg,
          packageContent: JSON.stringify([
            { contentId: prereqContent.id, title: 'Seed Prerequisite Content' },
            { contentId: content.id, title: 'Seed NestJS Content' },
          ]),
        },
        'certificate_package: package certificate link',
      );

      // 21) Explicit transaction / حركة واضحة بجانب audit logs
      await findOrCreate(
        transactionRepo,
        {
          table_name: 'seed_test_records',
          trans_type: TransactionType.CREATE,
          record_id: 0,
        },
        {
          table_name: 'seed_test_records',
          trans_type: TransactionType.CREATE,
          record_id: 0,
          json_file: JSON.stringify({
            tag: SEED_TAG,
            message:
              'English: test seed completed. عربي: تم إنشاء بيانات اختبار.',
          }),
          createdBy: superAdmin,
        },
        'transaction: seed_test_records',
      );
    });

    console.log('\n✅ Seed transaction completed successfully.');
    console.log(`Login test user: seed.student@edugap.test / ${PASSWORD}`);
    console.log(`System admin: seed.super.admin@edugap.test / ${PASSWORD}`);

    const missingTables: string[] = [];
    const tableCounts: Array<{ table: string; count: number }> = [];

    for (const meta of dataSource.entityMetadatas) {
      const count = await dataSource.manager.count(meta.target as any);
      tableCounts.push({ table: meta.tableName, count });
      if (count === 0) missingTables.push(meta.tableName);
    }

    tableCounts.sort((a, b) => a.table.localeCompare(b.table));
    console.table(tableCounts);

    if (missingTables.length) {
      console.warn('\n⚠️ Tables still empty:');
      console.warn(missingTables.join(', '));
      console.warn(
        'Note: classes without @Entity(), like Auth/Dashboard/Progress/Search/SystemAuth, are not database tables.',
      );
    } else {
      console.log(
        '\n✅ Every loaded TypeORM entity table has at least one record.',
      );
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('❌ Test seed failed:');
  console.error(error);
  process.exit(1);
});
