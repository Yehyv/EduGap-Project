import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Headers,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageStorage } from 'src/common/helpers/upload.helper';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    instituteId: number;
    refreshToken?: string;
  };
}
@Controller('institutes')
export class InstitutesController {
  constructor(private readonly institutesService: InstitutesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN') // بس ال SUPER_ADMIN يقدر يعمل institutes
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'logo', maxCount: 1 },
        { name: 'image_profile', maxCount: 1 },
      ],
      imageStorage('institute-images'),
    ),
  )
  create(
    @Body() createInstituteDto: CreateInstituteDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      image_profile?: Express.Multer.File[];
    },
  ) {
    const sysUser = req.user.sub;
    return this.institutesService.create(createInstituteDto, files, sysUser);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN') // بس ال SUPER_ADMIN يقدر يشوف كل ال institutes
  @Get('super-admin/institutes-list')
  findAll(@Headers('languageId') languageId: number) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.institutesService.findAll(langId);
  }
  @Get('all/nav')
  async instituteNav(
    @Headers('languageId') languageId: number | undefined,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe)
    limit: number,
  ) {
    return this.institutesService.instituteNav(languageId, limit);
  }
    @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/count')
  countInstitutes() {
    return this.institutesService.countInstitutes();
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'INST_ADMIN') // بس ال SUPER_ADMIN يقدر يشوف تفاصيل ال institute
  @Get('super-admin/institute/:id')
  findOne(@Param('id') id: string) {
    return this.institutesService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('super-admin/institute/:id')
  update(
    @Param('id') id: string,
    @Body() updateInstituteDto: UpdateInstituteDto,
  ) {
    return this.institutesService.update(+id, updateInstituteDto);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete('super-admin/institute/:id')
  remove(@Param('id') id: string) {
    return this.institutesService.remove(+id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('super-admin/dropdown/list')
  instituteDropdown(@Headers('languageId') languageId: number | undefined) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.institutesService.instituteDropDown(langId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch('super-admin/institute-status/:id')
  async changeInstituteStatus(@Param('id', ParseIntPipe) id: number) {
    return this.institutesService.toggleActive(id);
  }
}
