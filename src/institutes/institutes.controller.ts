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
  findAll() {
    return this.institutesService.findAll();
  }
  @Get('all/nav')
  async instituteNav(
    @Headers('languageId') languageId: number | undefined,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe)
    limit: number,
  ) {
    return this.institutesService.instituteNav(languageId, limit);
  }

  @Get(':id/super-admin/institute')
  findOne(@Param('id') id: string) {
    return this.institutesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstituteDto: UpdateInstituteDto,
  ) {
    return this.institutesService.update(+id, updateInstituteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.institutesService.remove(+id);
  }
  @Get('dropdown/list')
  instituteDropdown(@Headers('languageId') languageId: number | undefined) {
    return this.institutesService.instituteDropDown(languageId);
  }
}
