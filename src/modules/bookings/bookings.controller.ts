import { Controller, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './services/bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.bookingsService.create(createBookingDto);
  }

  @Patch(':id/pay')
  async pay(@Param('id', ParseIntPipe) id: number): Promise<BookingResponseDto> {
    return this.bookingsService.pay(id);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<BookingResponseDto> {
    return this.bookingsService.cancel(id);
  }

  @Patch(':id/refund')
  async refund(@Param('id', ParseIntPipe) id: number): Promise<BookingResponseDto> {
    return this.bookingsService.refund(id);
  }
}
