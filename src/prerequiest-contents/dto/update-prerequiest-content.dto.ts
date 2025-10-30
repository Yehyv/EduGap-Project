import { PartialType } from '@nestjs/mapped-types';
import { CreatePrerequiestContentDto } from './create-prerequiest-content.dto';

export class UpdatePrerequiestContentDto extends PartialType(
  CreatePrerequiestContentDto,
) {}
