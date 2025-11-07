import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ContactUsMessage {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity('contact_us')
export class ContactUs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  fullName: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ nullable: false })
  phoneNumber: string;

  @Column({ nullable: false })
  message: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: ContactUsMessage,
    default: ContactUsMessage.ACTIVE,
  })
  status: ContactUsMessage;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  deletedAt: Date | null;
}
