import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramDto } from './create-program.dto';
import { ProgramTranslationDto } from './create-program.dto';

export class UpdateProgramTranslationDto extends PartialType(
  ProgramTranslationDto,
) {}
export class UpdateProgramDto extends PartialType(CreateProgramDto) {}
