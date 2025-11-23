import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question, QuestionType } from './entities/question.entity';
import { QuestionTranslation } from './entities/question-translation.entity';
import {
  QuestionAnswer,
  QuestionAnswerLabel,
} from './entities/question-answer.entity';
import { QuestionAnswerTranslation } from './entities/question-answer-translation.entity';
import { Lesson, LessonType } from 'src/lessons/entities/lesson.entity';
import { Language } from 'src/languages/entities/language.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { LessonProgress } from 'src/progress/entities/lesson-progress.entity';
import { Enrollment } from 'src/enrollments/entities/enrollment.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuestionTranslation)
    private readonly questionTrRepo: Repository<QuestionTranslation>,
    @InjectRepository(QuestionAnswer)
    private readonly answerRepo: Repository<QuestionAnswer>,
    @InjectRepository(QuestionAnswerTranslation)
    private readonly answerTrRepo: Repository<QuestionAnswerTranslation>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepo: Repository<LessonProgress>,
    @InjectRepository(Enrollment)
    private readonly enrollRepo: Repository<Enrollment>,
  ) {}
  private pickTr<T extends { language?: { id?: number } }>(
    list: T[] | undefined,
    languageId?: number,
  ): T | undefined {
    if (!list || !list.length) return undefined;
    if (languageId == null) return list[0];
    return (
      list.find(
        (t: any) =>
          t?.language?.id === languageId || t?.languageId === languageId,
      ) ?? list[0]
    );
  }
  /**✅ Create question + answers + translations */
  async createQuestion(dto: CreateQuestionDto): Promise<Question> {
    const lesson = await this.lessonRepo.findOne({
      where: { id: dto.lessonId, is_active: 1 },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    if (lesson.lesson_type !== LessonType.QUESTIONS) {
      throw new BadRequestException('Lesson is not of type QUESTIONS');
    }

    if (!dto.answers || dto.answers.length === 0) {
      throw new BadRequestException('Question must have at least one answer');
    }

    if (!dto.translations || dto.translations.length === 0) {
      throw new BadRequestException(
        'Question must have at least one translation',
      );
    }

    // validate TRUE_FALSE: only A/B labels
    if (dto.type === QuestionType.TRUE_FALSE) {
      const invalid = dto.answers.some(
        (a) =>
          ![QuestionAnswerLabel.A, QuestionAnswerLabel.B].includes(a.label),
      );
      if (invalid) {
        throw new BadRequestException(
          'TRUE_FALSE question can only use labels A and B',
        );
      }
    }

    // 1) أنشئ السؤال نفسه
    const question = this.questionRepo.create({
      type: dto.type,
      lesson,
      is_active: 1,
    });

    const savedQuestion = await this.questionRepo.save(question);

    // 2) أنشئ ترجمات السؤال
    const questionTranslations: QuestionTranslation[] = dto.translations.map(
      (tr) =>
        this.questionTrRepo.create({
          title: tr.title,
          language: { id: tr.languageId },
          question: savedQuestion,
        }),
    );

    await this.questionTrRepo.save(questionTranslations);

    // 3) أنشئ الإجابات + جمع الـ translations بتاعتها
    const answerEntities: QuestionAnswer[] = [];
    const answerTranslationsEntities: QuestionAnswerTranslation[] = [];

    for (const ansDto of dto.answers) {
      const answer = this.answerRepo.create({
        label: ansDto.label,
        is_correct: ansDto.isCorrect ? 1 : 0,
        question: savedQuestion,
      });

      const savedAnswer = await this.answerRepo.save(answer);
      answerEntities.push(savedAnswer);

      for (const ansTrDto of ansDto.translations) {
        const ansTr = this.answerTrRepo.create({
          title: ansTrDto.title,
          language: { id: ansTrDto.languageId },
          answer: savedAnswer,
        });
        answerTranslationsEntities.push(ansTr);
      }
    }

    if (answerTranslationsEntities.length > 0) {
      await this.answerTrRepo.save(answerTranslationsEntities);
    }

    // 4) رجّع السؤال مع العلاقات
    const fullQuestion = await this.questionRepo.findOne({
      where: { id: savedQuestion.id },
      relations: ['translations', 'answers', 'answers.translations', 'lesson'],
    });

    return fullQuestion!;
  }

  /**✅ Get quiz (questions + answers) for a lesson in specific language */
  async getLessonQuiz(lessonId: number, languageId?: number): Promise<any> {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId, is_active: 1 },
      relations: [
        'questions',
        'questions.translations',
        'questions.translations.language',
        'questions.answers',
        'questions.answers.translations',
        'questions.answers.translations.language',
      ],
      order: {
        questions: {
          id: 'ASC',
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    if (lesson.lesson_type !== LessonType.QUESTIONS) {
      throw new BadRequestException('Lesson is not of type QUESTIONS');
    }

    const quizQuestions = lesson.questions
      .filter((q) => q.is_active === 1)
      .map((q) => {
        // pick translation
        const tr =
          (languageId &&
            q.translations?.find((t) => t.language?.id === languageId)) ||
          q.translations?.[0];

        const answers = q.answers.map((a) => {
          const atr = this.pickTr(a.translations, languageId);

          return {
            id: a.id,
            label: a.label,
            title: atr?.title ?? '',
          };
        });

        return {
          id: q.id,
          type: q.type,
          title: tr?.title ?? '',
          answers,
        };
      });

    return {
      lessonId: lesson.id,
      requiredScorePercent: lesson.questions_percentage_score ?? 0,
      questions: quizQuestions,
    };
  }

  /**✅ Submit quiz: لا نخزن إجابات الطالب، نحسب النتيجة فقط ونخزن summary في LessonProgress */
  async submitQuiz(userId: number, dto: SubmitQuizDto): Promise<any> {
    const lesson = await this.lessonRepo.findOne({
      where: { id: dto.lessonId, is_active: 1 },
      relations: ['topic', 'topic.content', 'questions', 'questions.answers'],
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    if (lesson.lesson_type !== LessonType.QUESTIONS) {
      throw new BadRequestException('This lesson is not a quiz');
    }

    const questions = lesson.questions.filter((q) => q.is_active === 1);
    if (!questions.length) {
      throw new BadRequestException('No questions found for this lesson');
    }

    // ✅ تأكد إنه Enrolled في نفس الـ content
    const contentId = lesson.topic?.content?.id;
    if (!contentId) {
      throw new BadRequestException('Lesson is not attached to a content');
    }

    const enrollment = await this.enrollRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } },
      select: ['id'],
    });

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this content');
    }

    // خريطة لإجابات الطالب
    const answersMap = new Map<number, QuestionAnswerLabel>();
    for (const a of dto.answers) {
      answersMap.set(a.questionId, a.label);
    }

    // خريطة للإجابة الصحيحة
    const correctMap = new Map<number, QuestionAnswer>();
    for (const q of questions) {
      const correct = q.answers.find((ans) => ans.is_correct === 1);
      if (correct) correctMap.set(q.id, correct);
    }

    const total = questions.length;
    let correctCount = 0;

    const questionsResult = questions.map((q) => {
      const correct = correctMap.get(q.id);
      const studentLabel = answersMap.get(q.id);

      const isCorrect =
        !!correct && !!studentLabel && correct.label === studentLabel;

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        correctLabel: correct?.label ?? null,
        studentLabel: studentLabel ?? null,
        isCorrect,
      };
    });

    const scorePercent =
      total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const passPercent = lesson.questions_percentage_score ?? 0;
    const isPassed = scorePercent >= passPercent;

    // ✅ لو نجح: نعتبر الدرس مكتمل في LessonProgress (من غير score ولا تفاصيل)
    if (isPassed) {
      const exists = await this.lessonProgressRepo.exist({
        where: {
          lesson: { id: lesson.id },
          user: { id: userId },
          enrollment: { id: enrollment.id },
        },
      });

      if (!exists) {
        const progress = this.lessonProgressRepo.create({
          lesson: { id: lesson.id },
          user: { id: userId },
          enrollment: { id: enrollment.id },
          // مش هنخزن score ولا is_passed لو مش محتاجه
        });

        await this.lessonProgressRepo.save(progress);
      }

      // لو ناجح: نرجع كمان تفاصيل الأسئلة عشان يراجع
      return {
        scorePercent,
        passPercent,
        isPassed,
        questions: questionsResult,
      };
    }

    // ⛔ لو راسب: ما نرجعش تفاصيل الأسئلة ولا الحلول
    return {
      scorePercent,
      passPercent,
      isPassed,
    };
  }
}
