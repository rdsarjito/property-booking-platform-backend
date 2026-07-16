import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DataSource, Raw } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Booking } from '../entities/booking.entity';
import { BookingStatusHistory } from '../entities/booking-status-history.entity';
import { BookingStatus } from '../enums/booking-status.enum';
import { Room } from '../../rooms/entities/room.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { BookingCodeHelper } from '../../../common/helpers/booking-code.helper';
import { PricingService } from './pricing.service';
import { CouponsService } from '../../coupons/coupons.service';
import { differenceInCalendarDays, parseISO } from 'date-fns';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly pricingService: PricingService,
    private readonly couponsService: CouponsService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Get room with pessimistic write lock (SELECT FOR UPDATE)
      const room = await manager
        .createQueryBuilder(Room, 'room')
        .setLock('pessimistic_write')
        .where('room.id = :id', { id: createBookingDto.roomId })
        .getOne();

      if (!room) {
        throw new NotFoundException(`Room with id ${createBookingDto.roomId} not found`);
      }

      // 2. Validate available unit
      if (room.availableUnit <= 0) {
        throw new ConflictException('No available units for this room type');
      }

      // 3. Validate and parse dates
      const checkIn = parseISO(createBookingDto.checkInDate);
      const checkOut = parseISO(createBookingDto.checkOutDate);
      const totalNights = differenceInCalendarDays(checkOut, checkIn);

      if (totalNights <= 0) {
        throw new BadRequestException('Check-out date must be after check-in date');
      }

      // 4. Validate coupon code if provided (to fail fast before locking units)
      let couponEntity = null;
      if (createBookingDto.couponCode) {
        couponEntity = await this.couponsService.findByCode(createBookingDto.couponCode);
        const subtotalEstim = room.pricePerNight * totalNights;
        const autoDiscountEstim = totalNights >= 3 ? subtotalEstim * 0.1 : 0;
        this.couponsService.validate(couponEntity, subtotalEstim - autoDiscountEstim);
      }

      // 5. Calculate final prices using PricingService
      const pricing = this.pricingService.calculate({
        pricePerNight: room.pricePerNight,
        totalNights,
        coupon: couponEntity
          ? {
              type: couponEntity.type,
              discountValue: couponEntity.discountValue,
              maxDiscount: couponEntity.maxDiscount,
            }
          : null,
      });

      // 6. Decrement available room units
      room.availableUnit -= 1;
      await manager.save(Room, room);

      // 7. Create booking record
      const expiredAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
      const bookingCode = BookingCodeHelper.generate();

      const booking = manager.create(Booking, {
        bookingCode,
        roomId: room.id,
        couponId: couponEntity ? couponEntity.id : null,
        customerName: createBookingDto.customerName,
        customerEmail: createBookingDto.customerEmail,
        checkInDate: createBookingDto.checkInDate,
        checkOutDate: createBookingDto.checkOutDate,
        totalNights,
        subtotal: pricing.subtotal,
        automaticDiscount: pricing.automaticDiscount,
        couponDiscount: pricing.couponDiscount,
        finalPrice: pricing.finalPrice,
        status: BookingStatus.PENDING,
        expiredAt,
      });

      const savedBooking = await manager.save(Booking, booking);

      // 9. Create history log
      const history = manager.create(BookingStatusHistory, {
        bookingId: savedBooking.id,
        fromStatus: BookingStatus.PENDING,
        toStatus: BookingStatus.PENDING,
        note: 'Booking initialized in PENDING state',
      });
      await manager.save(BookingStatusHistory, history);

      return this.mapToResponse(savedBooking);
    });
  }

  async pay(id: number): Promise<BookingResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with id ${id} not found`);
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new ConflictException(`Cannot pay booking with status ${booking.status}`);
      }

      // Check for expiry
      if (booking.expiredAt && new Date() > booking.expiredAt) {
        // Expire booking and restore room unit
        booking.status = BookingStatus.EXPIRED;
        await manager.save(Booking, booking);

        const room = await manager.findOne(Room, { where: { id: booking.roomId } });
        if (room) {
          room.availableUnit += 1;
          await manager.save(Room, room);
        }

        const history = manager.create(BookingStatusHistory, {
          bookingId: booking.id,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.EXPIRED,
          note: 'Booking payment failed: booking has expired',
        });
        await manager.save(BookingStatusHistory, history);

        throw new ConflictException('Booking has expired and cannot be paid');
      }

      // Complete payment
      const oldStatus = booking.status;
      booking.status = BookingStatus.PAID;
      booking.paidAt = new Date();
      const saved = await manager.save(Booking, booking);

      const history = manager.create(BookingStatusHistory, {
        bookingId: booking.id,
        fromStatus: oldStatus,
        toStatus: BookingStatus.PAID,
        note: 'Payment received, booking confirmed',
      });
      await manager.save(BookingStatusHistory, history);

      return this.mapToResponse(saved);
    });
  }

  async cancel(id: number): Promise<BookingResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with id ${id} not found`);
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new ConflictException(
          `Cannot cancel booking with status ${booking.status}. Paid bookings cannot be cancelled.`,
        );
      }

      // Restore room unit
      const room = await manager.findOne(Room, {
        where: { id: booking.roomId },
        lock: { mode: 'pessimistic_write' },
      });

      if (room) {
        room.availableUnit = Math.min(room.availableUnit + 1, room.totalUnit);
        await manager.save(Room, room);
      }

      const oldStatus = booking.status;
      booking.status = BookingStatus.CANCELLED;
      booking.cancelledAt = new Date();
      const saved = await manager.save(Booking, booking);

      const history = manager.create(BookingStatusHistory, {
        bookingId: booking.id,
        fromStatus: oldStatus,
        toStatus: BookingStatus.CANCELLED,
        note: 'Booking cancelled by customer',
      });
      await manager.save(BookingStatusHistory, history);

      return this.mapToResponse(saved);
    });
  }

  async refund(id: number): Promise<BookingResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with id ${id} not found`);
      }

      if (booking.status !== BookingStatus.PAID) {
        throw new ConflictException(
          `Cannot refund booking with status ${booking.status}. Only PAID bookings can be refunded.`,
        );
      }

      // Restore room unit
      const room = await manager.findOne(Room, {
        where: { id: booking.roomId },
        lock: { mode: 'pessimistic_write' },
      });

      if (room) {
        room.availableUnit = Math.min(room.availableUnit + 1, room.totalUnit);
        await manager.save(Room, room);
      }

      const oldStatus = booking.status;
      booking.status = BookingStatus.CANCELLED;
      booking.cancelledAt = new Date();
      const saved = await manager.save(Booking, booking);

      const history = manager.create(BookingStatusHistory, {
        bookingId: booking.id,
        fromStatus: oldStatus,
        toStatus: BookingStatus.CANCELLED,
        note: `Booking refunded. Refunding final amount of ${booking.finalPrice} to customer.`,
      });
      await manager.save(BookingStatusHistory, history);

      return this.mapToResponse(saved);
    });
  }

  private mapToResponse(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      bookingCode: booking.bookingCode,
      roomId: booking.roomId,
      couponId: booking.couponId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalNights: booking.totalNights,
      subtotal: booking.subtotal,
      automaticDiscount: booking.automaticDiscount,
      couponDiscount: booking.couponDiscount,
      finalPrice: booking.finalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
    };
  }

  @Cron('*/15 * * * *')
  async handleExpiredBookings(): Promise<void> {
    this.logger.log('Checking for expired pending bookings...');

    await this.dataSource.transaction(async (manager) => {
      const expiredBookings = await manager.find(Booking, {
        where: {
          status: BookingStatus.PENDING,
          expiredAt: Raw((alias) => `${alias} <= :now`, { now: new Date() }),
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (expiredBookings.length === 0) {
        return;
      }

      this.logger.log(`Found ${expiredBookings.length} expired bookings to process`);

      for (const booking of expiredBookings) {
        booking.status = BookingStatus.EXPIRED;
        await manager.save(Booking, booking);

        // Restore room unit
        const room = await manager.findOne(Room, {
          where: { id: booking.roomId },
          lock: { mode: 'pessimistic_write' },
        });

        if (room) {
          room.availableUnit = Math.min(room.availableUnit + 1, room.totalUnit);
          await manager.save(Room, room);
        }

        const history = manager.create(BookingStatusHistory, {
          bookingId: booking.id,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.EXPIRED,
          note: 'Booking expired automatically due to payment timeout',
        });
        await manager.save(BookingStatusHistory, history);
      }

      this.logger.log('Successfully expired all pending unpaid bookings');
    });
  }
}
