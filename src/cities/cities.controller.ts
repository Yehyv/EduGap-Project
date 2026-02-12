import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
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
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  create(
    @Body() createCityDto: CreateCityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.citiesService.create(createCityDto, req.user!.sub);
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
