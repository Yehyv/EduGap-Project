import { PartialType } from '@nestjs/mapped-types';
import { CreateContractPaymentDto } from './create-contract-payment.dto';

export class UpdateContractPaymentDto extends PartialType(
  CreateContractPaymentDto,
) {}
