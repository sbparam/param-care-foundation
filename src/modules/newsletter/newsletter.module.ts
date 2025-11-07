import { Module } from '@nestjs/common';
import {
  AdminNewsletterService,
  NewsletterService,
} from './newsletter.service';
import {
  AdminNewsLetterController,
  NewsletterController,
} from './newsletter.controller';
import { Newsletter } from './entities/newsletter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { RoleGuards } from 'src/guards/role/role.guard';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter]), TokenModule],
  controllers: [NewsletterController, AdminNewsLetterController],
  providers: [
    NewsletterService,
    AwsS3Service,
    AdminNewsletterService,
    RoleGuards,
  ],
})
export class NewsletterModule {}
