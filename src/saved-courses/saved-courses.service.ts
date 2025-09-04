import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedCourse } from './entities/saved-course.entity';
import { Course } from 'src/courses/entities/course.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SavedCoursesService {
  constructor(
    @InjectRepository(SavedCourse)
    private savedCourseRepository: Repository<SavedCourse>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async saveCourse(courseId: number, userId: number, userInstituteId?: number) {
    // التأكد من وجود اليوزر
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // التأكد من وجود الكورس
    let course: Course | null;
    if (userInstituteId) {
      course = await this.courseRepository.findOne({
        where: {
          id: courseId,
          programs: { institutes: { id: userInstituteId } },
        },
        relations: ['programs', 'programs.institutes'],
      });
    } else {
      course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
    }

    if (!course) {
      throw new NotFoundException(
        `Course ${courseId} not found or not accessible`,
      );
    }

    // التأكد إن الكورس مش محفوظ من قبل
    const existingSavedCourse = await this.savedCourseRepository.findOne({
      where: {
        course: { id: courseId },
        user: { id: userId },
      },
    });

    if (existingSavedCourse) {
      throw new BadRequestException('Course already saved');
    }

    // حفظ الكورس
    const savedCourse = this.savedCourseRepository.create({
      course,
      user,
    });

    return this.savedCourseRepository.save(savedCourse);
  }

  async unsaveCourse(courseId: number, userId: number) {
    const savedCourse = await this.savedCourseRepository.findOne({
      where: {
        course: { id: courseId },
        user: { id: userId },
      },
    });

    if (!savedCourse) {
      throw new NotFoundException('Saved course not found');
    }

    await this.savedCourseRepository.remove(savedCourse);
    return { message: 'Course unsaved successfully' };
  }

  async getUserSavedCourses(
    userId: number,
    userInstituteId?: number,
    languageId?: number,
  ) {
    const query = this.savedCourseRepository
      .createQueryBuilder('savedCourse')
      .leftJoinAndSelect('savedCourse.course', 'course')
      .leftJoinAndSelect('course.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('course.programs', 'program')
      .leftJoinAndSelect('program.institutes', 'institute')
      .where('savedCourse.userId = :userId', { userId })
      .orderBy('savedCourse.savedAt', 'DESC');

    if (userInstituteId) {
      query.andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      });
    }

    if (languageId) {
      query.andWhere('translation.languageId = :languageId', { languageId });
    }

    const savedCourses = await query.getMany();

    if (!savedCourses.length) {
      throw new NotFoundException('No saved courses found');
    }

    return savedCourses;
  }

  // دالة للتأكد إن الكورس محفوظ ولا لا
  async isCoursesSaved(courseId: number, userId: number): Promise<boolean> {
    const savedCourse = await this.savedCourseRepository.findOne({
      where: {
        course: { id: courseId },
        user: { id: userId },
      },
    });

    return !!savedCourse;
  }
}
