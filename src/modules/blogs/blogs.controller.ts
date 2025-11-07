import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  Query,
} from '@nestjs/common';
import { AdminBlogsService, BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { IFileSignedUrl } from 'src/utils/interface/uploadImage.interface';
// import uuid4 from 'uuid4';
import { v4 as uuidv4 } from 'uuid';

import { fileNameExtensionRemover } from 'src/utils/file/file.util';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { RoleGuards } from 'src/guards/role/role.guard';
import { UserRole } from '../auth/entities/auth.entity';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';

@Controller('blogs')
export class BlogsController {
  private awsS3Service: AwsS3Service;
  constructor(private readonly blogsService: BlogsService) {}

  @Get('fetchAllBlogs')
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const blogs = await this.blogsService.findAll(search || {});
    return {
      message: 'Blogs Found',
      data: blogs,
    };
  }

  @Get('getParticularBlog/:slug')
  async findOne(@Param('slug') slug: string) {
    const blog = await this.blogsService.findOne(slug);
    return { message: 'Blog Found', data: blog };
  }
}

@Controller('admin/blogs')
export class AdminBlogsController {
  constructor(
    private readonly adminBlogsService: AdminBlogsService,
    private awsS3Service: AwsS3Service,
  ) {}

  @Post('createBlog')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async create(@Body() createBlogDto: CreateBlogDto) {
    const createBlog = await this.adminBlogsService.create(createBlogDto);
    return {
      message: 'Blog Created Successfully',
      data: createBlog,
    };
  }

  @Post('PostSignedUrlForBlogImages')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async getSignedUrlForBlogImages(@Body() { imageName }: IFileSignedUrl) {
    // const uuid = uuid4();
    const uuid = uuidv4();
    const fileName = `BlogImages/${uuid}/${uuid}.${fileNameExtensionRemover(
      imageName,
    )}`;
    return this.awsS3Service.getPresignedUrlAndImage(
      fileName,
      'UPLOAD',
      60 * 15,
    );
  }

  @Get('fetchAllBlogs')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const blogs = await this.adminBlogsService.findAll(search || {});
    return {
      message: 'Blogs Found',
      ...blogs,
    };
  }

  @Get('getParticularBlog/:slug')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async findOne(@Param('slug') slug: string) {
    const blog = await this.adminBlogsService.findOne(slug);
    return { message: 'Blog Found', data: blog };
  }

  @Patch('updateParticularBlog/:slug')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async update(
    @Param('slug') slug: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const getUpdatedBlogs = await this.adminBlogsService.update(
      slug,
      updateBlogDto,
    );
    return {
      message: 'Blog Updated Successfully',
      data: { ...getUpdatedBlogs },
    };
  }

  @Delete('deleteParticularBlog/:id')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const deleteBlog = await this.adminBlogsService.remove(+id);
    return { message: 'Blog Deleted Successfully', data: {} };
  }
}
