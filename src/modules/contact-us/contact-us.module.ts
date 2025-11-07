import { Module } from '@nestjs/common';
import { AdminContactUsService, ContactUsService } from './contact-us.service';
import {
  AdminContactUsController,
  ContactUsController,
} from './contact-us.controller';
import { ContactUs } from './entities/contact-us.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContactUs])],
  controllers: [ContactUsController, AdminContactUsController],
  providers: [ContactUsService, AdminContactUsService],
  exports: [ContactUsService, AdminContactUsService],
})
export class ContactUsModule {}
