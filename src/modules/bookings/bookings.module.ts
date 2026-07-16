import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './services/bookings.service';
import { PricingService } from './services/pricing.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { BookingStatusHistory } from './entities/booking-status-history.entity';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingStatusHistory]), CouponsModule],
  controllers: [BookingsController],
  providers: [BookingsService, PricingService],
  exports: [BookingsService, TypeOrmModule],
})
export class BookingsModule {}
