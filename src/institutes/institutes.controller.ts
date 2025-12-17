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
} from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageStorage } from 'src/common/helpers/upload.helper';

@Controller('institutes')
export class InstitutesController {
  constructor(private readonly institutesService: InstitutesService) {}

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
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      image_profile?: Express.Multer.File[];
    },
  ) {
    return this.institutesService.create(createInstituteDto, files);
  }

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

  @Get('super-admin/institute/:id')
  findOne(
    @Param('id') id: string,
    @Headers('languageId') languageId: number | undefined,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.institutesService.findOne(+id, langId);
  }

  @Patch('super-admin/institute/:id')
  update(
    @Param('id') id: string,
    @Body() updateInstituteDto: UpdateInstituteDto,
  ) {
    return this.institutesService.update(+id, updateInstituteDto);
  }

  @Delete('super-admin/institute/:id')
  remove(@Param('id') id: string) {
    return this.institutesService.remove(+id);
  }
  @Get('super-admin/dropdown/list')
  instituteDropdown(@Headers('languageId') languageId: number | undefined) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.institutesService.instituteDropDown(langId);
  }
  @Patch('super-admin/institute-status/:id')
  async changeInstituteStatus(@Param('id', ParseIntPipe) id: number) {
    return this.institutesService.toggleActive(id);
  }
}
