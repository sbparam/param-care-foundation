import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EventStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  date: Date;

  @Column({ type: 'time', nullable: false })
  event_starting_time: string;

  @Column({ type: 'time', nullable: false })
  event_finishing_time: string;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  attendees: string;

  @Column({ nullable: false, type: 'simple-array' })
  images: string[];

  @Column({ nullable: false, type: 'longtext' })
  description: string;

  @Column({ nullable: false })
  slug: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.ACTIVE,
  })
  status: EventStatus;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  deletedAt: Date | null;
}
