import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum BlogStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  author: string;

  @Column({ nullable: false })
  mins_read: string;

  @Column({ nullable: false, type: 'longtext' })
  image: string;

  @Column({ nullable: false, type: 'longtext' })
  description: string;

  @Column({ nullable: false })
  slug: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: BlogStatus,
    default: BlogStatus.ACTIVE,
  })
  status: BlogStatus;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  deletedAt: Date | null;
}
