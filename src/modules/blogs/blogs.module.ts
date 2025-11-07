import { Module } from '@nestjs/common';
import { AdminBlogsService, BlogsService } from './blogs.service';
import { AdminBlogsController, BlogsController } from './blogs.controller';
import { Blog } from './entities/blog.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { TokenModule } from '../token/token.module';
import { RoleGuards } from 'src/guards/role/role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), TokenModule],
  controllers: [BlogsController, AdminBlogsController],
  providers: [BlogsService, AwsS3Service, AdminBlogsService, RoleGuards],
})
export class BlogsModule {}
