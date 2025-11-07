import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContactUsDto {
  @IsString()
  @IsNotEmpty()
  public fullName: string;

  @IsString()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public subject: string;

  @IsString()
  @IsNotEmpty()
  public phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  public message: string;
}
