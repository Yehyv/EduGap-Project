import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContentCategoriesService } from './content-categories.service';
import { CreateContentCategoryDto } from './dto/create-content-category.dto';
import { UpdateContentCategoryDto } from './dto/update-content-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('content-categories')
export class ContentCategoriesController {
  constructor(
    private readonly contentCategoriesService: ContentCategoriesService,
  ) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(
    @Body() createContentCategoryDto: CreateContentCategoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.contentCategoriesService.create(
      createContentCategoryDto,
      req.user!.sub,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/category-list')
  findAll(@Headers('languageId') languageId?: string) {
    const langId = languageId !== undefined ? +languageId : 0;
    return this.contentCategoriesService.findAll(langId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/category/:id')
  findOne(@Param('id') id: string) {
    return this.contentCategoriesService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('super-admin/:id')
  update(
    @Param('id') id: string,
    @Body() updateContentCategoryDto: UpdateContentCategoryDto,
  ) {
    return this.contentCategoriesService.update(+id, updateContentCategoryDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('super-admin/:id')
  remove(@Param('id') id: string) {
    return this.contentCategoriesService.remove(+id);
  }
}
