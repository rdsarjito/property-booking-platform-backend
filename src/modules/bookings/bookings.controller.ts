import { Controller, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './services/bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new booking transaction',
    description:
      'Requires name, email, roomId, check-in, check-out dates, and optional coupon code. Employs row locking for race condition prevention.',
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created in PENDING state',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid date ranges or format' })
  @ApiResponse({ status: 404, description: 'Room or property not found' })
  @ApiResponse({ status: 409, description: 'Overbooking conflict (no units available)' })
  @ApiResponse({ status: 422, description: 'Invalid coupon or min transaction constraint' })
  async create(@Body() createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.bookingsService.create(createBookingDto);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Mark a PENDING booking as PAID' })
  @ApiParam({ name: 'id', description: 'Booking database ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking marked as PAID successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking expired or already paid/cancelled' })
  async pay(@Param('id', ParseIntPipe) id: number): Promise<BookingResponseDto> {
    return this.bookingsService.pay(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel a PENDING booking',
    description:
      'Cancels the booking and restores room available unit. PAID bookings cannot be cancelled.',
  })
  @ApiParam({ name: 'id', description: 'Booking database ID' })
  @ApiResponse({
    status: 200,
    description: 'Booking marked as CANCELLED, room unit restored',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking already paid/cancelled' })
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<BookingResponseDto> {
    return this.bookingsService.cancel(id);
  }

  @Patch(':id/refund')
  @ApiOperation({
    summary: 'Refund a PAID booking (Bonus Flow)',
    description: 'Cancels the booking, restores room unit, and logs refund to history.',
  })
  @ApiParam({ name: 'id', description: 'Booking database ID' })
  @ApiResponse({
    status: 200,
    description: 'Paid booking refunded, room unit restored',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 409, description: 'Booking is not PAID' })
  async refund(@Param('id', ParseIntPipe) id: number): Promise<BookingResponseDto> {
    return this.bookingsService.refund(id);
  }
}
