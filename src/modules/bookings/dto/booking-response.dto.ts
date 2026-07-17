import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../enums/booking-status.enum';

export class BookingResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id!: string;

  @ApiProperty({ example: 'BK-20260720-A1B2C3D4' })
  bookingCode!: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  roomId!: string;

  @ApiProperty({ example: 'd4e5f6a7-b8c9-0123-def0-1234567890ab', nullable: true })
  couponId!: string | null;

  @ApiProperty({ example: 'John Doe' })
  customerName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  customerEmail!: string;

  @ApiProperty({ example: '2026-07-20' })
  checkInDate!: string;

  @ApiProperty({ example: '2026-07-23' })
  checkOutDate!: string;

  @ApiProperty({ example: 3 })
  totalNights!: number;

  @ApiProperty({ example: 3600000 })
  subtotal!: number;

  @ApiProperty({ example: 360000 })
  automaticDiscount!: number;

  @ApiProperty({ example: 100000 })
  couponDiscount!: number;

  @ApiProperty({ example: 3140000 })
  finalPrice!: number;

  @ApiProperty({ example: 'PENDING', enum: BookingStatus })
  status!: BookingStatus;

  @ApiProperty({ example: '2026-07-17T14:30:00.000Z' })
  createdAt!: Date;
}
