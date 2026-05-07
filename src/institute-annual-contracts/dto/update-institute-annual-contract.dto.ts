import { PartialType } from '@nestjs/mapped-types';
import { CreateInstituteAnnualContractDto } from './create-institute-annual-contract.dto';

export class UpdateInstituteAnnualContractDto extends PartialType(
  CreateInstituteAnnualContractDto,
) {}
