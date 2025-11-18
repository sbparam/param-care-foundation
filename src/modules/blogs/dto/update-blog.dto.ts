import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { BlogStatus } from '../entities/blog.entity';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  public title?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim())
  public description?: string;

  @IsString()
  @IsOptional()
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public image?: string;

  @IsString()
  @IsOptional()
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public mins_read?: string;

  @IsString()
  @IsOptional()
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public author?: string;

  @IsEnum(BlogStatus)
  @IsOptional()
  @Transform(
    ({ value }: TransformFnParams) => typeof value === 'string' && value.trim(),
  )
  public status: BlogStatus;
}
