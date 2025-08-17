import { Match } from 'src/common/decorators/match.decorators';

export class SignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
