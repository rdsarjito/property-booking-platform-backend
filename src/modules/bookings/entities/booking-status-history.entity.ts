import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from './booking.entity';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity('booking_status_histories')
@Index(['bookingId'])
export class BookingStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId!: string;

  @Column({ name: 'from_status', type: 'enum', enum: BookingStatus })
  fromStatus!: BookingStatus;

  @Column({ name: 'to_status', type: 'enum', enum: BookingStatus })
  toStatus!: BookingStatus;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @ManyToOne(() => Booking, (booking) => booking.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt!: Date;
}
