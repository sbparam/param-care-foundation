import { Module } from '@nestjs/common';
import { AdminEventsService, EventsService } from './events.service';
import { AdminEventsController, EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { RoleGuards } from 'src/guards/role/role.guard';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), TokenModule],
  controllers: [EventsController, AdminEventsController],
  providers: [AwsS3Service, EventsService, AdminEventsService, RoleGuards],
})
export class EventsModule {}
