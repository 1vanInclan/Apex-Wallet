import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'The email is not valid' })
  @IsNotEmpty({ message: 'The email is required' })
  email: string;

  @IsString({ message: 'The password must be a text' })
  @IsNotEmpty({ message: 'The password is required' })
  @MinLength(6, { message: 'The password must have at least 6 characters' })
  password: string;
}
