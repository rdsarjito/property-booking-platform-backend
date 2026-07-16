import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';
import { BookingStatusHistory } from './booking-status-history.entity';
import { DecimalTransformer } from '../../../common/helpers/decimal.transformer';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity('bookings')
@Index(['bookingCode'], { unique: true })
@Index(['roomId', 'status'])
@Index(['customerEmail'])
@Index(['status', 'expiredAt'])
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'booking_code', type: 'varchar', length: 30, unique: true })
  bookingCode!: string;

  @Column({ name: 'room_id', type: 'int' })
  roomId!: number;

  @Column({ name: 'coupon_id', type: 'int', nullable: true })
  couponId!: number | null;

  @Column({ name: 'customer_name', type: 'varchar', length: 100 })
  customerName!: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 150 })
  customerEmail!: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate!: string;

  @Column({ name: 'check_out_date', type: 'date' })
  checkOutDate!: string;

  @Column({ name: 'total_nights', type: 'int' })
  totalNights!: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  subtotal!: number;

  @Column({
    name: 'automatic_discount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  automaticDiscount!: number;

  @Column({
    name: 'coupon_discount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  couponDiscount!: number;

  @Column({
    name: 'final_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  finalPrice!: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
  expiredAt!: Date | null;

  @ManyToOne(() => Room, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @ManyToOne(() => Coupon, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon | null;

  @OneToMany(() => BookingStatusHistory, (history) => history.booking)
  statusHistory!: BookingStatusHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
