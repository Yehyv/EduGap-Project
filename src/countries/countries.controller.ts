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
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
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
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}
  @Post()
  create(
    @Body() createCountryDto: CreateCountryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.countriesService.create(createCountryDto, req.user!.sub);
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
