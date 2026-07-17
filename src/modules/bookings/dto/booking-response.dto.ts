import { BookingStatus } from '../enums/booking-status.enum';

export class BookingResponseDto {
  id!: string;
  bookingCode!: string;
  roomId!: string;
  couponId!: string | null;
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
