import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserStatus } from '../entities/auth.entity';
import { Transform, TransformFnParams } from 'class-transformer';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, {
    message:
      'No Special Characters or digits and no Consecutive Spaces in First Name',
  })
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, {
    message:
      'No Special Characters or digits and no Consecutive Spaces in Last Name',
  })
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public email: string;

  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\#?!@$%^&*-]).{4,}$/, {
    message:
      'Password should be 8-20 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public password: string;

  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\#?!@$%^&*-]).{4,}$/, {
    message:
      'Password should be 8-20 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public confirmPassword: string;

  @IsBoolean()
  @IsOptional()
  public isVerified?: boolean;

  @IsDate()
  @IsOptional()
  public verifiedAt: Date;

  @IsEnum(UserStatus)
  @IsOptional()
  public status: UserStatus;
}
