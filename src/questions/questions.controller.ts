import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LessonUnlockGuard } from 'src/lessons/lesson-unlock.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
// خليه تحت prefix مناسب مثلاً /questions أو /lessons/:id/quiz
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // مثال: POST /questions
  @Post()
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.questionsService.createQuestion(dto);
  }

  @UseGuards(JwtAuthGuard, LessonUnlockGuard)
  @Get('lesson/:lessonId')
  getLessonQuiz(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.questionsService.getLessonQuiz(lessonId, langId);
  }
  @Get('super-admin/questions/:lessonId')
  getQuizQuestions(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Headers('languageId') languageId?: string,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.questionsService.getLessonQuiz(lessonId, langId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  submitQuiz(@Body() dto: SubmitQuizDto, @Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return this.questionsService.submitQuiz(userId, dto);
  }
}
