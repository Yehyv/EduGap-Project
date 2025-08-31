import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
export class CreateStudentDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  major: string;

  @IsNotEmpty()
  @IsString()
  skills: string;

  @IsNotEmpty()
  @IsNumber()
  programId: number;
}
