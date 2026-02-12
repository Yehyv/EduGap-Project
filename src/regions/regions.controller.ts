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
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
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
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  create(
    @Body() createRegionDto: CreateRegionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.regionsService.create(createRegionDto, req.user!.sub);
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
