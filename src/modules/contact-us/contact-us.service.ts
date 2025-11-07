import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ISearchInPageKeyword } from 'src/utils/interface/searchInPage.interface';
import { Repository } from 'typeorm';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { ContactUs, ContactUsMessage } from './entities/contact-us.entity';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private contactUsRepository: Repository<ContactUs>,
  ) {}

  async sendMessages(createContactUsDto: CreateContactUsDto) {
    const newMessage = this.contactUsRepository.create(createContactUsDto);
    return this.contactUsRepository.save(newMessage);
  }
}
// id, fullName, email, subject, phoneNumber, message, status
@Injectable()
export class AdminContactUsService {
  constructor(
    @InjectRepository(ContactUs)
    private adminContactUsRepository: Repository<ContactUs>,
  ) {}

  async findAll(
    searchInPageKeyword: ISearchInPageKeyword,
  ): Promise<{ messages: ContactUs[]; totalMessages: number }> {
    const queryBuilder =
      this.adminContactUsRepository.createQueryBuilder('ContactUs');

    // Keyword filtering
    if (searchInPageKeyword.keyword?.trim()) {
      queryBuilder.andWhere(
        'LOWER(contactus.title) LIKE :keyword OR LOWER(contactus.message) LIKE :keyword',
        { keyword: `%${searchInPageKeyword.keyword}%` },
      );
    }

    // Sorting by latest
    queryBuilder.orderBy('contactus.createdAt', 'DESC');

    // Pagination
    if (searchInPageKeyword.currentPage && searchInPageKeyword.limit) {
      const skip =
        (searchInPageKeyword.currentPage - 1) * searchInPageKeyword.limit;
      queryBuilder.skip(skip).take(searchInPageKeyword.limit);
    }

    // Fetch paginated data
    const messagesData = await queryBuilder.getMany();

    const totalMessages = await this.adminContactUsRepository.count();

    return {
      messages: messagesData,
      totalMessages,
    };
  }

  // METHOD TO FETCH PARTICULAR CONTACT US MESSAGES FROM DATABASE
  async findOneMessage(id: number): Promise<ContactUs> {
    const messages = await this.adminContactUsRepository.findOne({
      where: { id: id, status: ContactUsMessage.ACTIVE },
      select: [
        'fullName',
        'email',
        'subject',
        'message',
        'createdAt',
        'id',
        'status',
      ],
    });

    if (!messages) {
      throw new NotFoundException({
        message: 'Message Not Found',
      });
    }
    return messages;
  }

  async remove(id: number): Promise<void> {
    const deletedMessage = await this.adminContactUsRepository
      .createQueryBuilder()
      .update(ContactUs)
      .set({ status: ContactUsMessage.DELETED, deletedAt: new Date() })
      .where({ id: id })
      .execute();
  }
}
