import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ImageStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

@Entity('gallery')
export class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'simple-array' })
  images: string[];

  @Column({
    nullable: false,
    type: 'enum',
    enum: ImageStatus,
    default: ImageStatus.ACTIVE,
  })
  status: ImageStatus;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  deletedAt: Date | null;
}
