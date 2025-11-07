import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { NewsLetterStatus } from '../entities/newsletter.entity';

export class CreateNewsletterDto {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsEnum(NewsLetterStatus)
  @IsOptional()
  public status: NewsLetterStatus;

  @IsDate()
  @IsOptional()
  public createdAt?: Date;

  @IsDate()
  @IsOptional()
  public updatedAt?: Date;

  @IsDate()
  @IsOptional()
  public deletedAt?: Date;
}
