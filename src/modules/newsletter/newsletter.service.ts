import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { Repository } from 'typeorm';
import { Newsletter, NewsLetterStatus } from './entities/newsletter.entity';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';
import slugify from 'slugify';

@Injectable()
export class NewsletterService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectRepository(Newsletter)
    private NewsletterRepository: Repository<Newsletter>,
  ) {}

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ newsletters: Newsletter[]; totalNewsletters: number }> {
    const { keyword, currentPage, limit } = searchInPageKeyword;

    const queryBuilder = this.NewsletterRepository.createQueryBuilder(
      'newsletter',
    )
      .where('newsletter.status = :status', { status: NewsLetterStatus.ACTIVE })
      .orderBy('newsletter.createdAt', 'DESC');

    // Keyword filtering
    if (keyword?.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      queryBuilder.andWhere(
        `(LOWER(newsletter.title) LIKE :keyword 
          OR DATE_FORMAT(newsletter.createdAt, '%Y-%m-%d') LIKE :keyword)`,
        { keyword: `%${lowerKeyword}%` },
      );
    }

    // Pagination
    if (currentPage && limit) {
      const skip = (currentPage - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    // If you had an image column in newsletters like blogs, you could apply presigned URL logic here

    const NewsLettersData = await queryBuilder.getMany();
    // Pre-signed URLs
    for (const Newsletter of NewsLettersData) {
      if (Newsletter.content) {
        const awsData = await this.awsS3Service.getPresignedUrlAndImage(
          Newsletter.content,
          'DOWNLOAD',
          60 * 60 * 10,
        );
        if (awsData?.preSignedUrl) {
          Newsletter.content = awsData.preSignedUrl;
        }
      }
    }

    // Clone query for total count
    const totalCountQuery = this.NewsletterRepository.createQueryBuilder(
      'newsletter',
    ).where('newsletter.status = :status', { status: NewsLetterStatus.ACTIVE });

    if (keyword?.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      totalCountQuery.andWhere(
        `(LOWER(newsletter.title) LIKE :keyword 
          OR DATE_FORMAT(newsletter.createdAt, '%Y-%m-%d') LIKE :keyword)`,
        { keyword: `%${lowerKeyword}%` },
      );
    }

    const totalNewsletters = await totalCountQuery.getCount();

    return { newsletters: NewsLettersData, totalNewsletters };
  }

  async findOne(slug: string): Promise<Newsletter> {
    const newsletter = await this.NewsletterRepository.findOne({
      where: { slug: slug, status: NewsLetterStatus.ACTIVE },
      select: [
        'id',
        'title',
        'content',
        'slug',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!newsletter) {
      throw new NotFoundException({ message: 'Newsletter Not Found' });
    }

    if (newsletter.content) {
      const content = await this.awsS3Service.getPresignedUrlAndImage(
        newsletter.content,
        'DOWNLOAD',
        60 * 60 * 10,
      );
      newsletter.content = content?.preSignedUrl ?? ''; // fallback to empty string
    }

    return newsletter;
  }
}

@Injectable()
export class AdminNewsletterService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectRepository(Newsletter)
    private NewsletterRepository: Repository<Newsletter>,
  ) {}

  async create(createNewsletterDto: Partial<Newsletter>): Promise<Object> {
    const baseSlug = slugify(createNewsletterDto.title!, {
      lower: true,
    });
    let generatedSlug = baseSlug;
    let slugSuffix = 2;

    const slugExists = async (slug: string): Promise<boolean> => {
      const existingCategory = await this.NewsletterRepository.findOne({
        where: { slug },
      });
      return !!existingCategory;
    };

    while (await slugExists(generatedSlug)) {
      generatedSlug = `${baseSlug}-${slugSuffix}`;
      slugSuffix++;
    }

    const newNewsletter = this.NewsletterRepository.create({
      ...createNewsletterDto,
      slug: generatedSlug, // Set the generated slug
    });
    return this.NewsletterRepository.save(newNewsletter);
  }

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ newsletters: Newsletter[]; totalNewsletters: number }> {
    const { keyword, currentPage, limit } = searchInPageKeyword;

    const queryBuilder = this.NewsletterRepository.createQueryBuilder(
      'newsletter',
    )
      .select([
        'newsletter.id',
        'newsletter.title',
        'newsletter.content',
        'newsletter.slug',
        'newsletter.status',
        'newsletter.createdAt',
      ])
      .where('newsletter.status = :status', { status: NewsLetterStatus.ACTIVE })
      .orderBy('newsletter.createdAt', 'DESC');

    // Keyword filtering
    if (keyword?.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      queryBuilder.andWhere(
        `(LOWER(newsletter.title) LIKE :keyword 
        OR DATE_FORMAT(newsletter.createdAt, '%Y-%m-%d') LIKE :keyword)`,
        { keyword: `%${lowerKeyword}%` },
      );
    }

    // Pagination
    if (currentPage && limit) {
      const skip = (currentPage - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    let newslettersData = await queryBuilder.getMany();

    // Generate pre-signed URLs for content (S3 keys)
    for (const data of newslettersData) {
      if (data.content) {
        const awsData = await this.awsS3Service.getPresignedUrlAndImage(
          data.content, // here content column holds the S3 key
          'DOWNLOAD',
          60 * 60 * 10, // 10 hours
        );

        if (awsData?.preSignedUrl) {
          data.content = awsData.preSignedUrl;
        }
      }
    }

    // Clone query for total count
    const totalCountQuery = this.NewsletterRepository.createQueryBuilder(
      'newsletter',
    ).where('newsletter.status = :status', { status: NewsLetterStatus.ACTIVE });

    if (keyword?.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      totalCountQuery.andWhere(
        `(LOWER(newsletter.title) LIKE :keyword 
        OR DATE_FORMAT(newsletter.createdAt, '%Y-%m-%d') LIKE :keyword)`,
        { keyword: `%${lowerKeyword}%` },
      );
    }

    const totalNewsletters = await totalCountQuery.getCount();

    return { newsletters: newslettersData, totalNewsletters };
  }

  async findOne(slug: string): Promise<Newsletter> {
    const newsletter = await this.NewsletterRepository.findOne({
      where: { slug: slug, status: NewsLetterStatus.ACTIVE },
      select: [
        'id',
        'title',
        'content',
        'slug',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!newsletter) {
      throw new NotFoundException({ message: 'Newsletter Not Found' });
    }

    if (newsletter.content) {
      const awsData = await this.awsS3Service.getPresignedUrlAndImage(
        newsletter.content,
        'DOWNLOAD',
        60 * 60 * 10,
      );
      if (awsData?.preSignedUrl) {
        newsletter.content = awsData.preSignedUrl;
      }
    }

    return newsletter;
  }

  async remove(id: number) {
    const deletedNewsLetter =
      await this.NewsletterRepository.createQueryBuilder()
        .update(Newsletter)
        .set({ status: NewsLetterStatus.DELETED, deletedAt: new Date() })
        .where({ id: id })
        .execute();
  }
}
