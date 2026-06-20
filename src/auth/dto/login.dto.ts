import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'The email must be a email validate' })
  @IsNotEmpty({ message: 'The email is required' })
  email: string;

  @IsNotEmpty({ message: 'The password is required' })
  @MinLength(6, { message: 'The password must have at least 6 characters' })
  password: string;
}
