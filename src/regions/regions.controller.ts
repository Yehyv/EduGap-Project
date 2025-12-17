import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionsService.create(createRegionDto);
  }

  @Get()
  findAll(@Headers('languageId') languageId: number) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.regionsService.findAll(langId);
  }
  @Get('super-admin/dropdown/list/:cityId')
  regionDropdown(
    @Headers('languageId') languageId: number | undefined,
    @Param('cityId') cityId: number,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.regionsService.RegionDropDown(cityId, langId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('languageId') languageId: number) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.regionsService.findOne(+id, langId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionsService.update(+id, updateRegionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionsService.remove(+id);
  }
}
