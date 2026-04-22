import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UserActivationDto {
  @IsInt()
  @Min(1)
  reasonId: number;

  @IsOptional()
  @IsString()
  note?: string;
}