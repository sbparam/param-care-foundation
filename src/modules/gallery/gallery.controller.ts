import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { fileNameExtensionRemover } from 'src/utils/file/file.util';
import { IFileSignedUrl } from 'src/utils/interface/uploadImage.interface';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { v4 as uuidv4 } from 'uuid';
import { AdminGalleryService, GalleryService } from './gallery.service';
import { RoleGuards } from 'src/guards/role/role.guard';
import { UserRole } from '../auth/entities/auth.entity';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';
import { CreateGalleryDto } from './dto/create-gallery.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}
  @Get('fetchAllImages')
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const galleries = await this.galleryService.findAll(search || {});
    return { message: 'Images fetched successfully', data: galleries };
  }
}

@Controller('admin/gallery')
export class AdminGalleryController {
  constructor(
    private readonly adminGalleryService: AdminGalleryService,
    private awsS3Service: AwsS3Service,
  ) {}

  @Post('insertData')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async addImages(@Body() createGalleryDto: CreateGalleryDto) {
    const gallery = await this.adminGalleryService.create(createGalleryDto);
    return { message: 'Images added to gallery successfully', data: gallery };
  }

  @Post('PostSignedUrlForGalleryImages')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async getSignedUrlForBlogImages(@Body() { imageName }: IFileSignedUrl) {
    // const uuid = uuid4();
    const uuid = uuidv4();
    const fileName = `GalleryImages/${uuid}/${uuid}.${fileNameExtensionRemover(
      imageName,
    )}`;
    return this.awsS3Service.getPresignedUrlAndImage(
      fileName,
      'UPLOAD',
      60 * 15,
    );
  }

  @Get('fetchAllImages')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const galleries = await this.adminGalleryService.findAll(
      search ?? ({} as ISearchInPageKeyword),
    );
    return { message: 'Admin gallery fetched successfully', data: galleries };
  }

  @Delete('deleteParticularImage/:id')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.adminGalleryService.remove(+id);
    return { message: 'Gallery deleted successfully' };
  }
}
