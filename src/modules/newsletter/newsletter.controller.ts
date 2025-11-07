import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import {
  AdminNewsletterService,
  NewsletterService,
} from './newsletter.service';
import { UserRole } from '../auth/entities/auth.entity';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { RoleGuards } from 'src/guards/role/role.guard';
import { IFileSignedUrl } from 'src/utils/interface/uploadImage.interface';
import { fileNameExtensionRemover } from 'src/utils/file/file.util';
import { v4 as uuidv4 } from 'uuid';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';

@Controller('newsletter')
export class NewsletterController {
  private awsS3Service: AwsS3Service;
  constructor(private readonly newsletterService: NewsletterService) {}

  @Get('fetchAllNewsletters')
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const newsletter = await this.newsletterService.findAll(search || {});
    return {
      message: 'newsletter Found',
      data: newsletter,
    };
  }

  @Get('getParticularNewsletter/:slug')
  async findOne(@Param('slug') slug: string) {
    const blog = await this.newsletterService.findOne(slug);
    return { message: 'Blog Found', data: blog };
  }
}

@Controller('admin/newsletter')
export class AdminNewsLetterController {
  constructor(
    private readonly adminNewsletterService: AdminNewsletterService,
    private awsS3Service: AwsS3Service,
  ) {}

  @Post('createNewsletter')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async create(@Body() createNewsletterDto: CreateNewsletterDto) {
    const createNewsLetter =
      await this.adminNewsletterService.create(createNewsletterDto);
    return {
      message: 'NewsLetter Created Successfully',
      data: createNewsLetter,
    };
  }

  @Post('PostSignedUrlForNewsLetter')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async getSignedUrlForBlogImages(@Body() { imageName }: IFileSignedUrl) {
    // const uuid = uuid4();
    const uuid = uuidv4();
    const fileName = `NewsLetters/${uuid}/${uuid}.${fileNameExtensionRemover(
      imageName,
    )}`;
    return this.awsS3Service.getPresignedUrlAndImage(
      fileName,
      'UPLOAD',
      60 * 15,
    );
  }

  @Get('fetchAllNewsletter')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const newsletter = await this.adminNewsletterService.findAll(search || {});
    return {
      message: 'Newsletter Found',
      ...newsletter,
    };
  }

  @Get('getParticularNewsletter/:slug')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async findOne(@Param('slug') slug: string) {
    const newsletter = await this.adminNewsletterService.findOne(slug);
    return { message: 'Newsletter Found', data: newsletter };
  }

  @Delete('deleteParticularNewsletter/:id')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const deleteNewsletter = await this.adminNewsletterService.remove(+id);
    return { message: 'Newsletter Deleted Successfully', data: {} };
  }
}
