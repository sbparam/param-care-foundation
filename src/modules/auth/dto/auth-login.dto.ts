import { IsString, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}
