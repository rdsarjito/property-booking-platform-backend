import { Injectable, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { parseISO, isAfter } from 'date-fns';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon code ${code} not found`);
    }

    return coupon;
  }

  validate(coupon: Coupon, subtotalAfterAutoDiscount: number): void {
    if (!coupon.isActive) {
      throw new UnprocessableEntityException(`Coupon code ${coupon.code} is inactive`);
    }

    if (coupon.validUntil) {
      const todayStr = new Date().toISOString().split('T')[0];
      const today = parseISO(todayStr);
      const expiry = parseISO(coupon.validUntil);
      if (isAfter(today, expiry)) {
        throw new UnprocessableEntityException(`Coupon code ${coupon.code} has expired`);
      }
    }

    if (subtotalAfterAutoDiscount < coupon.minTransaction) {
      throw new UnprocessableEntityException(
        `Minimum transaction of ${coupon.minTransaction} is required to use coupon ${coupon.code}`,
      );
    }
  }
}
