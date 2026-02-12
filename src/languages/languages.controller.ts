import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
interface AuthenticatedRequest extends Request {
  user?: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  create(
    @Body() createLanguageDto: CreateLanguageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.languagesService.create(createLanguageDto, req.user!.sub);
  }

  @Get('super-admin/languages-list')
  findAll() {
    return this.languagesService.findAll();
  }

  @Get(':id/super-admin/language')
  findOne(@Param('id') id: number) {
    return this.languagesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return this.languagesService.update(+id, updateLanguageDto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: number) {
    return this.languagesService.softDelete(+id);
  }
  @Patch('restore/:id')
  restore(@Param('id') id: number) {
    return this.languagesService.restore(+id);
  }
}
