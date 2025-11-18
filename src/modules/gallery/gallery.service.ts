import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { Repository } from 'typeorm';
import { Gallery, ImageStatus } from './entities/gallery.entity';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
    private awsS3Service: AwsS3Service,
  ) {}

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ galleries: Gallery[]; totalGalleries: number }> {
    const { currentPage = 1, limit = 10 } = searchInPageKeyword;

    const skip = (currentPage - 1) * limit;

    const [galleries, totalGalleries] =
      await this.galleryRepository.findAndCount({
        where: { status: ImageStatus.ACTIVE },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

    for (const gallery of galleries) {
      if (gallery.images && gallery.images.length > 0) {
        gallery.images = await Promise.all(
          gallery.images.map(async (img) => {
            const data = await this.awsS3Service.getPresignedUrlAndImage(
              img,
              'DOWNLOAD',
              60 * 60 * 10,
            );
            return data?.preSignedUrl || img;
          }),
        );
      }
    }

    return { galleries, totalGalleries };
  }
}

@Injectable()
export class AdminGalleryService {
  constructor(
    @InjectRepository(Gallery)
    private galleryRepository: Repository<Gallery>,
    private awsS3Service: AwsS3Service,
  ) {}
  async create(createGalleryDto: CreateGalleryDto): Promise<Gallery> {
    const { images } = createGalleryDto;

    if (!images || images.length === 0) {
      throw new BadRequestException('No image paths provided.');
    }

    const gallery = this.galleryRepository.create({
      images, // ✅ make sure we assign the images
      status: ImageStatus.ACTIVE,
    });

    return this.galleryRepository.save(gallery);
  }

  async findAll(searchInPageKeyword: ISearchInPageKeyword): Promise<Gallery[]> {
    const { keyword, currentPage, limit } = searchInPageKeyword;

    const queryBuilder = this.galleryRepository
      .createQueryBuilder('gallery')
      .where('gallery.status = :status', { status: 'active' })
      .orderBy('gallery.createdAt', 'DESC');

    // Pagination
    if (currentPage && limit) {
      const skip = (currentPage - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const galleries = await queryBuilder.getMany();

    for (const gallery of galleries) {
      if (gallery.images && gallery.images.length > 0) {
        gallery.images = await Promise.all(
          gallery.images.map(async (imgKey) => {
            const result = await this.awsS3Service.getPresignedUrlAndImage(
              imgKey,
              'DOWNLOAD',
              60 * 60 * 2, // 2 hours
            );
            return result?.preSignedUrl || imgKey;
          }),
        );
      }
    }

    return galleries;
  }

  async findOne(id: number): Promise<Gallery> {
    const gallery = await this.galleryRepository.findOne({ where: { id } });
    if (!gallery) throw new NotFoundException({ message: 'Gallery not found' });
    return gallery;
  }

  async remove(id: number): Promise<void> {
    const gallery = await this.findOne(id);
    gallery.status = ImageStatus.DELETED;
    gallery.deletedAt = new Date();
    await this.galleryRepository.save(gallery);
  }
}
