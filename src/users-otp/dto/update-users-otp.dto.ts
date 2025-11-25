import { PartialType } from '@nestjs/mapped-types';
import { CreateUsersOtpDto } from './create-users-otp.dto';

export class UpdateUsersOtpDto extends PartialType(CreateUsersOtpDto) {}
