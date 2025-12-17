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
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  findAll(@Headers('languageId') languageId: number) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.citiesService.findAll(langId);
  }
  @Get('super-admin/dropdown/list/:countryId')
  instituteDropdown(
    @Headers('languageId') languageId: number | undefined,
    @Param('countryId') countryId: number,
  ) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.citiesService.CityDropDown(countryId, langId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('languageId') languageId: number) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.citiesService.findOne(+id, langId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(+id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citiesService.remove(+id);
  }
}
