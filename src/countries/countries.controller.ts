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
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  findAll(@Headers('languageId') languageId: number) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.countriesService.findAll(langId);
  }
  @Get('super-admin/dropdown/list')
  regionDropdown(@Headers('languageId') languageId: number | undefined) {
    const langId = languageId ? Number(languageId) : undefined;
    return this.countriesService.CountryDropDown(langId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.countriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(+id, updateCountryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countriesService.remove(+id);
  }
}
