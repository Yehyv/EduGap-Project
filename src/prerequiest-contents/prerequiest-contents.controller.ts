import {
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { PrerequisitesService } from './prerequiest-contents.service';
import { AssignPrerequisitesDto } from './dto/assign-prerequisites.dto';
import { UnassignPrerequisiteDto } from './dto/unassign-prerequisite.dto';

@Controller('contents/:contentId/prerequisites')
export class PrerequisitesController {
  constructor(private readonly service: PrerequisitesService) {}

  @Get()
  list(@Param('contentId', ParseIntPipe) contentId: number) {
    return this.service.list(contentId);
  }

  @Post('assign')
  assign(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: AssignPrerequisitesDto,
  ) {
    return this.service.assign(contentId, dto);
  }

  @Delete('unassign')
  unassign(
    @Param('contentId', ParseIntPipe) contentId: number,
    @Body() dto: UnassignPrerequisiteDto,
  ) {
    return this.service.unassign(contentId, dto);
  }
}
