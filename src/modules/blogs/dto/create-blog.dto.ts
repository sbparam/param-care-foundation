import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Blog, BlogStatus } from '../entities/blog.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBlogDto extends PartialType(Blog) {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsNotEmpty()
  public author: string;

  @IsString()
  @IsNotEmpty()
  public mins_read: string;

  @IsString()
  @IsNotEmpty()
  public image: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  @IsEnum(BlogStatus)
  @IsOptional()
  public status: BlogStatus;

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
