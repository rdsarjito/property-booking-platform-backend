import { BookingStatus } from '../enums/booking-status.enum';

export class BookingResponseDto {
  id!: number;
  bookingCode!: string;
  roomId!: number;
  couponId!: number | null;
  customerName!: string;
  customerEmail!: string;
  checkInDate!: string;
  checkOutDate!: string;
  totalNights!: number;
  subtotal!: number;
  automaticDiscount!: number;
  couponDiscount!: number;
  finalPrice!: number;
  status!: BookingStatus;
  createdAt!: Date;
}
