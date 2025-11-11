import {
  Controller,
  Get,
  Query,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @UseGuards(OptionalJwtAuthGuard)
  @Get('contents')
  async searchContents(
    @Query('q') q: string,
    @Headers('languageId') languageId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const userId = req?.user?.sub ? Number(req.user.sub) : undefined;
    return this.searchService.searchContents(q ?? '', {
      languageId: languageId ? Number(languageId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 8,
      userId,
    });
  }
}
