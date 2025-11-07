import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminContactUsService, ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';

@Controller('contactUs')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post('sendMessage')
  async create(@Body() createContactUsDto: CreateContactUsDto) {
    const sendMessage =
      await this.contactUsService.sendMessages(createContactUsDto);
    return {
      message: 'Message sent successfully',
      data: sendMessage,
    };
  }
}

@Controller('admin/contactUs')
export class AdminContactUsController {
  constructor(private readonly adminContactUsService: AdminContactUsService) {}

  // METHOD TO FETCH ALL CONTACT US MESSAGES
  @Post('getAllMessages')
  async findAllMessages(@Body() searchInPage: ISearchInPageKeyword = {}) {
    const messages = await this.adminContactUsService.findAll(searchInPage);
    return {
      message: 'Messages Fetched Successfully',
      data: messages,
    };
  }

  // METHOD TO FETCH PARTICULAR CONTACT US MESSAGE
  @Get('fetchParticularMessage/:id')
  // @UseGuards(RoleGuards)
  // @SetMetadata("role", UserRole.ADMIN)
  async findOneMsg(@Param('id') id: number) {
    const contactMessage = await this.adminContactUsService.findOneMessage(id);
    return { message: 'Message Fetched Successfully', data: contactMessage };
  }

  // METHOD TO DELETE PARTICULAR CONTACT US MESSAGE
  @Delete('deleteMessages/:id')
  // @UseGuards(RoleGuards)
  // @SetMetadata("role", UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const isMessageRemoved = await this.adminContactUsService.remove(+id);
    return { message: 'Message Deleted Successfully', data: {} };
  }
}
