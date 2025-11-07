import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventStatus } from '../entities/event.entity';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsNotEmpty()
  public date: Date;

  @IsNotEmpty()
  public event_starting_time: string;

  @IsNotEmpty()
  public event_finishing_time: string;

  @IsEnum(EventStatus)
  @IsOptional()
  public status: EventStatus;

  @IsString()
  @IsNotEmpty()
  public location: string;

  @IsString()
  @IsNotEmpty()
  public attendees: string;

  @IsArray()
  @IsString({ each: true })
  public images: string[];

  @IsString()
  @IsNotEmpty()
  public description: string;

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
