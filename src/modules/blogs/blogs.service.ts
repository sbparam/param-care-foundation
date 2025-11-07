import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Repository } from 'typeorm';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog, BlogStatus } from './entities/blog.entity';
import { AwsS3Service } from 'src/utils/services/aws-s3/aws-s3.service';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';

@Injectable()
export class BlogsService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectRepository(Blog)
    private BlogsRepository: Repository<Blog>,
  ) {}

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ blogs: Blog[]; totalBlogs: number }> {
    const { keyword, currentPage, limit } = searchInPageKeyword;

    const queryBuilder = this.BlogsRepository.createQueryBuilder('blogs')
      .where('blogs.status = :status', { status: 'active' })
      .orderBy('blogs.createdAt', 'DESC');

    // Keyword filtering with MySQL-friendly DATE_FORMAT
    if (keyword?.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      queryBuilder.andWhere(
        `(LOWER(blogs.title) LIKE :keyword 
        OR LOWER(blogs.description) LIKE :keyword 
        OR DATE_FORMAT(blogs.createdAt, '%Y-%m-%d') LIKE :keyword)`,
        { keyword: `%${lowerKeyword}%` },
      );
    }

    // Pagination
    if (currentPage && limit) {
      const skip = (currentPage - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const blogsData = await queryBuilder.getMany();

    // Pre-signed URLs
    for (const blog of blogsData) {
      if (blog.image) {
        const awsData = await this.awsS3Service.getPresignedUrlAndImage(
          blog.image,
          'DOWNLOAD',
          60 * 60 * 10,
        );
        if (awsData?.preSignedUrl) {
          blog.image = awsData.preSignedUrl;
        }
      }
    }

    // Clone query for total count
    const totalCountQuery = this.BlogsRepository.createQueryBuilder(
      'blogs',
    ).where('blogs.status = :status', { status: 'active' });

    if (keyword?.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      totalCountQuery.andWhere(
        `(LOWER(blogs.title) LIKE :keyword 
        OR LOWER(blogs.description) LIKE :keyword 
        OR DATE_FORMAT(blogs.createdAt, '%Y-%m-%d') LIKE :keyword)`,
        { keyword: `%${lowerKeyword}%` },
      );
    }

    const totalBlogs = await totalCountQuery.getCount();

    return { blogs: blogsData, totalBlogs };
  }

  async findOne(slug: string): Promise<Blog> {
    const blog = await this.BlogsRepository.findOne({
      where: { slug: slug, status: BlogStatus.ACTIVE },
      select: [
        'title',
        'description',
        'image',
        'slug',
        'status',
        'author',
        'id',
        'mins_read',
        'createdAt',
      ],
    });

    if (!blog) {
      throw new NotFoundException({ message: 'Blog Not Found' });
    }

    if (blog.image) {
      const imageInfo = await this.awsS3Service.getPresignedUrlAndImage(
        blog.image,
        'DOWNLOAD',
        60 * 60 * 10,
      );
      blog.image = imageInfo?.preSignedUrl ?? ''; // fallback to empty string
    }

    return blog;
  }
}

@Injectable()
export class AdminBlogsService {
  constructor(
    private awsS3Service: AwsS3Service,
    @InjectRepository(Blog)
    private BlogsRepository: Repository<Blog>,
  ) {}

  async create(createBlogDto: Partial<Blog>): Promise<Object> {
    const baseSlug = slugify(createBlogDto.title!, {
      lower: true,
    });
    let generatedSlug = baseSlug;
    let slugSuffix = 2;

    const slugExists = async (slug: string): Promise<boolean> => {
      const existingCategory = await this.BlogsRepository.findOne({
        where: { slug },
      });
      return !!existingCategory;
    };

    while (await slugExists(generatedSlug)) {
      generatedSlug = `${baseSlug}-${slugSuffix}`;
      slugSuffix++;
    }

    const newBlog = this.BlogsRepository.create({
      ...createBlogDto,
      slug: generatedSlug, // Set the generated slug
    });
    return this.BlogsRepository.save(newBlog);
  }

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ blogs: Blog[] }> {
    const queryBuilder = this.BlogsRepository.createQueryBuilder('blogs')
      .select([
        'blogs.title',
        'blogs.description',
        'blogs.image',
        'blogs.author',
        'blogs.slug',
        'blogs.createdAt',
        'blogs.status',
        'blogs.id',
      ])
      .orderBy('blogs.createdAt', 'DESC');

    // Keyword filtering
    if (searchInPageKeyword.keyword?.trim()) {
      queryBuilder.andWhere(
        'LOWER(blogs.title) LIKE :keyword OR LOWER(blogs.description) LIKE :keyword',
        { keyword: `%${searchInPageKeyword.keyword}%` },
      );
    }

    // Pagination
    if (searchInPageKeyword.currentPage && searchInPageKeyword.limit) {
      const skip =
        (searchInPageKeyword.currentPage - 1) * searchInPageKeyword.limit;
      queryBuilder.skip(skip).take(searchInPageKeyword.limit);
    }

    const blogsData = await queryBuilder.getMany();

    // Generate pre-signed URLs for each image
    for (const data of blogsData) {
      if (data.image) {
        const awsData = await this.awsS3Service.getPresignedUrlAndImage(
          data.image,
          'DOWNLOAD',
          60 * 60 * 10,
        );

        if (awsData?.preSignedUrl) {
          data.image = awsData.preSignedUrl;
        }
      }
    }

    return { blogs: blogsData };
  }

  async findOne(slug: string): Promise<Blog> {
    const blog = await this.BlogsRepository.findOne({
      where: { slug: slug },
      select: [
        'title',
        'description',
        'image',
        'slug',
        'status',
        'author',
        'id',
      ],
    });

    if (!blog) {
      throw new NotFoundException({ message: 'Blog Not Found' });
    }

    // const awsData = await this.awsS3Service.getPresignedUrlAndImage(
    //   blog.image,
    //   'DOWNLOAD',
    //   60 * 60 * 10,
    // );

    // if (awsData?.preSignedUrl) {
    //   blog.image = awsData.preSignedUrl;
    // }

    return blog;
  }

  async update(
    slug: string,
    updateBlogDto: UpdateBlogDto,
  ): Promise<object | null> {
    const isValidBlog = await this.findOne(slug);
    if (!isValidBlog) {
      throw new NotFoundException({ message: 'NOT FOUND' });
    } else {
      const queryBuilder = await this.BlogsRepository.createQueryBuilder()
        .update(Blog)
        .set({
          title: updateBlogDto.title,
          description: updateBlogDto.description,
          image: updateBlogDto.image,
          author: updateBlogDto.author,
          status: updateBlogDto.status,
          mins_read: updateBlogDto.mins_read,
        })
        .where({ slug: isValidBlog.slug })
        .execute();

      const updatedBlog = await this.BlogsRepository.findOne({
        where: { slug: isValidBlog.slug },
      });

      return updatedBlog;
    }
  }

  async remove(id: number): Promise<void> {
    const deletedBlog = await this.BlogsRepository.createQueryBuilder()
      .update(Blog)
      .set({ status: BlogStatus.DELETED, deletedAt: new Date() })
      .where({ id: id })
      .execute();
  }
}
