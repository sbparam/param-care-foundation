import { PartialType } from '@nestjs/mapped-types';
import { Gallery, ImageStatus } from '../entities/gallery.entity';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto extends PartialType(Gallery) {
  @IsArray()
  @IsString({ each: true })
  public images: string[];

  @IsEnum(ImageStatus)
  @IsOptional()
  public status: ImageStatus;

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
