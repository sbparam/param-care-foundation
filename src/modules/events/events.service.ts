import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';

@Injectable()
export class EventsService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectRepository(Event)
    private EventRepository: Repository<Event>,
  ) {}

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ events: Event[]; totalEvents: number }> {
    const queryBuilder = this.EventRepository.createQueryBuilder('event');

    // Filter: only active events
    queryBuilder.where('event.status = :status', { status: 'active' });

    // Keyword filtering
    if (searchInPageKeyword.keyword?.trim()) {
      queryBuilder.andWhere(
        '(LOWER(event.title) LIKE :keyword OR LOWER(event.description) LIKE :keyword)',
        { keyword: `%${searchInPageKeyword.keyword.toLowerCase()}%` },
      );
    }

    // Sorting by latest
    queryBuilder.orderBy('event.createdAt', 'DESC');

    // Pagination
    if (searchInPageKeyword.currentPage && searchInPageKeyword.limit) {
      const skip =
        (searchInPageKeyword.currentPage - 1) * searchInPageKeyword.limit;
      queryBuilder.skip(skip).take(searchInPageKeyword.limit);
    }

    const eventsData = await queryBuilder.getMany();

    // Generate pre-signed URLs for images
    for (const event of eventsData) {
      if (event.images && event.images.length > 0) {
        event.images = await Promise.all(
          event.images.map(async (img) => {
            const imageInfo = await this.awsS3Service.getPresignedUrlAndImage(
              img,
              'DOWNLOAD',
              60 * 60 * 10,
            );
            return imageInfo?.preSignedUrl || img;
          }),
        );
      }
    }

    // Get total count of all active events (without pagination)
    const totalEvents = await this.EventRepository.count({
      where: { status: EventStatus.ACTIVE },
    });

    return {
      events: eventsData,
      totalEvents,
    };
  }

  async findOne(slug: string): Promise<Event> {
    const event = await this.EventRepository.findOne({
      where: { slug: slug, status: EventStatus.ACTIVE },
      select: [
        'title',
        'date',
        'event_starting_time',
        'event_finishing_time',
        'status',
        'location',
        'attendees',
        'images',
        'description',
        'id',
        'slug',
      ],
    });

    if (!event) {
      throw new NotFoundException({ message: 'Event Not Found' });
    }

    if (event.images && event.images.length > 0) {
      const signedUrls = await Promise.all(
        event.images.map(async (image) => {
          const imageInfo = await this.awsS3Service.getPresignedUrlAndImage(
            image,
            'DOWNLOAD',
            60 * 60 * 10,
          );
          return imageInfo?.preSignedUrl ?? ''; // fallback to empty string
        }),
      );

      // Optionally: filter out empty strings if you don't want them
      event.images = signedUrls.filter((url): url is string => !!url);
    }

    return event;
  }
}

export class AdminEventsService {
  constructor(
    private awsS3Service: AwsS3Service,

    @InjectRepository(Event)
    private EventRepository: Repository<Event>,
  ) {}
  async create(createEventDto: CreateEventDto): Promise<Object> {
    const baseSlug = slugify(createEventDto.title!, {
      lower: true,
    });
    let generatedSlug = baseSlug;
    let slugSuffix = 2;

    const slugExists = async (slug: string): Promise<boolean> => {
      const existingCategory = await this.EventRepository.findOne({
        where: { slug },
      });
      return !!existingCategory;
    };

    while (await slugExists(generatedSlug)) {
      generatedSlug = `${baseSlug}-${slugSuffix}`;
      slugSuffix++;
    }

    const newEvent = this.EventRepository.create({
      ...createEventDto,
      slug: generatedSlug,
    });
    return this.EventRepository.save(newEvent);
  }

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ events: Event[]; totalEvents: number }> {
    const queryBuilder = this.EventRepository.createQueryBuilder('Event');

    // Keyword filtering
    if (searchInPageKeyword.keyword?.trim()) {
      queryBuilder.andWhere(
        'LOWER(event.title) LIKE :keyword OR LOWER(event.description) LIKE :keyword',
        { keyword: `%${searchInPageKeyword.keyword}%` },
      );
    }

    // Sorting by latest
    queryBuilder.orderBy('event.createdAt', 'DESC');

    // Pagination
    if (searchInPageKeyword.currentPage && searchInPageKeyword.limit) {
      const skip =
        (searchInPageKeyword.currentPage - 1) * searchInPageKeyword.limit;
      queryBuilder.skip(skip).take(searchInPageKeyword.limit);
    }

    // Fetch paginated data
    const eventsData = await queryBuilder.getMany();

    // Generate pre-signed URLs for each image
    for (const event of eventsData) {
      if (event.images && event.images.length > 0) {
        event.images = await Promise.all(
          event.images.map(async (img) => {
            const imageInfo = await this.awsS3Service.getPresignedUrlAndImage(
              img,
              'DOWNLOAD',
              60 * 60 * 10,
            );
            return imageInfo?.preSignedUrl || img;
          }),
        );
      }
    }

    // Get total count of all events
    const totalEvents = await this.EventRepository.count();

    return {
      events: eventsData,
      totalEvents,
    };
  }

  async findOne(slug: string): Promise<Event> {
    const event = await this.EventRepository.findOne({
      where: { slug: slug },
      select: [
        'title',
        'date',
        'event_starting_time',
        'event_finishing_time',
        'status',
        'location',
        'attendees',
        'images',
        'description',
        'id',
        'slug',
      ],
    });

    if (!event) {
      throw new NotFoundException({ message: 'Event Not Found' });
    }

    if (event.images && event.images.length > 0) {
      const signedUrls = await Promise.all(
        event.images.map(async (image) => {
          const imageInfo = await this.awsS3Service.getPresignedUrlAndImage(
            image,
            'DOWNLOAD',
            60 * 60 * 10,
          );
          return imageInfo?.preSignedUrl ?? ''; // fallback to empty string
        }),
      );

      // Optionally: filter out empty strings if you don't want them
      event.images = signedUrls.filter((url): url is string => !!url);
    }

    return event;
  }

  async update(
    slug: string,
    updateEventDto: UpdateEventDto,
  ): Promise<object | null> {
    const isValidEvent = await this.findOne(slug);
    if (!isValidEvent) {
      throw new NotFoundException({ message: 'NOT FOUND' });
    } else {
      const queryBuilder = await this.EventRepository.createQueryBuilder()
        .update(Event)
        .set({
          title: updateEventDto.title,
          date: updateEventDto.date,
          event_starting_time: updateEventDto.event_starting_time,
          event_finishing_time: updateEventDto.event_finishing_time,
          location: updateEventDto.location,
          attendees: updateEventDto.attendees,
          description: updateEventDto.description,
          images: updateEventDto.images,
          status: updateEventDto.status,
        })
        .where({ slug: isValidEvent.slug })
        .execute();

      const updatedBlog = await this.EventRepository.findOne({
        where: { slug: isValidEvent.slug },
      });

      return updatedBlog;
    }
  }

  async remove(id: number): Promise<void> {
    const deletedEvent = await this.EventRepository.createQueryBuilder()
      .update(Event)
      .set({ status: EventStatus.DELETED, deletedAt: new Date() })
      .where({ id: id })
      .execute();
  }
}
