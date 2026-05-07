import { IsNotEmpty, IsString } from 'class-validator';

export class CancelContractPaymentDto {
  @IsString()
  @IsNotEmpty()
  cancelReason: string;
}
