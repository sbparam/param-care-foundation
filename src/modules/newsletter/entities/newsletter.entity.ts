import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum NewsLetterStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity('newsletter')
export class Newsletter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;

  @Column({ nullable: false })
  slug: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: NewsLetterStatus,
    default: NewsLetterStatus.ACTIVE,
  })
  status: NewsLetterStatus;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  deletedAt: Date | null;
}
