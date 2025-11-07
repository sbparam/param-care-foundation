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
  Put,
} from '@nestjs/common';
import { AdminEventsService, EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { IFileSignedUrl } from 'src/utils/interface/uploadImage.interface';
import { fileNameExtensionRemover } from 'src/utils/file/file.util';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { v4 as uuidv4 } from 'uuid';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';
import { RoleGuards } from 'src/guards/role/role.guard';
import { UserRole } from '../auth/entities/auth.entity';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private awsS3Service: AwsS3Service,
  ) {}

  @Get('fetchAllEvents')
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const eventsData = await this.eventsService.findAll(search || {});
    return { message: 'Events Fetched Successfully', ...eventsData };
  }

  @Get('fetchParticularEvent/:slug')
  async findOne(@Param('slug') slug: string) {
    const event = await this.eventsService.findOne(slug);
    return { message: 'Event Fetched Successfully', data: event };
  }
}

@Controller('admin/events')
export class AdminEventsController {
  constructor(
    private readonly adminEventsService: AdminEventsService,
    private awsS3Service: AwsS3Service,
  ) {}

  @Post('createEvent')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async create(@Body() createEventDto: CreateEventDto) {
    const event = await this.adminEventsService.create(createEventDto);
    return { message: 'Event Added Successfully', data: event };
  }

  @Post('PostPresignedUrlForEventPostImage')
  async getSignedUrlForEventPostImage(@Body() { imageName }: IFileSignedUrl) {
    const uuid = uuidv4();
    const fileName = `EventPostImages/${uuid}/${uuid}.${fileNameExtensionRemover(
      imageName,
    )}`;
    return this.awsS3Service.getPresignedUrlAndImage(
      fileName,
      'UPLOAD',
      60 * 15,
    );
  }

  @Get('fetchAllEvents')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async findAll(@Query() search?: ISearchInPageKeyword) {
    const eventsData = await this.adminEventsService.findAll(search || {});
    return { message: 'Events Fetched Successfully', ...eventsData };
  }

  @Get('fetchParticularEvent/:slug')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async findOne(@Param('slug') slug: string) {
    const event = await this.adminEventsService.findOne(slug);
    return { message: 'Event Fetched Successfully', data: event };
  }

  @Put('updateParticularEvent/:slug')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async update(
    @Param('slug') slug: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const updatedEvent = await this.adminEventsService.update(
      slug,
      updateEventDto,
    );
    return { message: 'Event Updated Successfully', data: { ...updatedEvent } };
  }

  @Delete('deleteParticularEvent/:id')
  @UseGuards(RoleGuards)
  @SetMetadata('role', UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const deletedEvent = await this.adminEventsService.remove(+id);
    return { message: 'Event Deleted Successfully', data: {} };
  }
}
