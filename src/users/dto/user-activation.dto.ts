import { IsNotEmpty, IsString } from 'class-validator';

export class UserActivationDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
