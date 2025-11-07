import { Module } from '@nestjs/common';
import { AdminGalleryService, GalleryService } from './gallery.service';
import {
  AdminGalleryController,
  GalleryController,
} from './gallery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gallery } from './entities/gallery.entity';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { RoleGuards } from 'src/guards/role/role.guard';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Gallery]), TokenModule],
  controllers: [GalleryController, AdminGalleryController],
  providers: [GalleryService, AdminGalleryService, AwsS3Service, RoleGuards],
})
export class GalleryModule {}
