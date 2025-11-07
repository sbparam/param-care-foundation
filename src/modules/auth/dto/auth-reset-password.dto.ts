import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, Matches, Length, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Length(8, 20)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[\#?!@$%^&*-]).{4,}$/, {
    message:
      'Password should be 8-20 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
  })
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public newPassword: string;

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

  // @IsNotEmpty()
  // public hasTokenQueryParam: string;
  // public token: string;
}
