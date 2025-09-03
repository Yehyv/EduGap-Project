import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/students/entities/student.entity';
import { Repository } from 'typeorm';
import { Lesson } from 'src/lessons/entities/lesson.entity';
import { LessonProgress } from './entities/lesson-progress.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private lessonProgressRepository: Repository<LessonProgress>,
  ) {}
  async startLesson(
    lessonId: number,
    userId: number,
    userInstituteId?: number,
  ) {
    // نجيب الطالب اللي يخص اليوزر ده
    const student = await this.studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!student) throw new NotFoundException('Student not found');

    // نجيب الدرس ونتأكد إنه تابع لمعهد الطالب
    const lesson = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .where('lesson.id = :lessonId', { lessonId })
      .andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      })
      .getOne();

    if (!lesson) throw new NotFoundException('Lesson not found');

    // نجيب أو ننشئ progress
    let progress = await this.lessonProgressRepository.findOne({
      where: {
        lesson: { id: lesson.id },
        student: { id: student.id },
      },
      relations: ['lesson', 'student'],
    });

    if (!progress) {
      progress = this.lessonProgressRepository.create({
        lesson,
        student,
        status: 'in progress',
      });
    } else {
      progress.status = 'in progress';
    }

    return this.lessonProgressRepository.save(progress);
  }
  async completeLesson(
    lessonId: number,
    userId: number,
    userInstituteId?: number,
  ) {
    const student = await this.studentRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!student) throw new NotFoundException('Student not found');
    const lesson = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoin('topic.content', 'content')
      .leftJoin('content.courses', 'course')
      .leftJoin('course.programs', 'program')
      .leftJoin('program.institutes', 'institute')
      .leftJoinAndSelect('topic.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('lesson.id = :lessonId', { lessonId })
      .andWhere('institute.id = :instituteId', {
        instituteId: userInstituteId,
      })
      .getOne();
    if (!lesson) throw new NotFoundException('Lesson not found');
    let progress = await this.lessonProgressRepository.findOne({
      where: {
        lesson: { id: lesson.id },
        student: { id: student.id },
      },
      relations: ['lesson', 'student'],
    });

    if (!progress) {
      progress = this.lessonProgressRepository.create({
        lesson,
        student,
      });
    }

    progress.status = 'completed';

    return this.lessonProgressRepository.save(progress);
  }
}
