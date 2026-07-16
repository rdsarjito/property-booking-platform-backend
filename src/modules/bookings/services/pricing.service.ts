import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';

export interface PricingContext {
  pricePerNight: number;
  totalNights: number;
  coupon?: {
    type: 'PERCENT' | 'FIXED';
    discountValue: number;
    maxDiscount: number | null;
  } | null;
}

export interface PricingResult {
  subtotal: number;
  automaticDiscount: number;
  couponDiscount: number;
  finalPrice: number;
}

interface DiscountStrategy {
  calculate(context: PricingContext, subtotal: Decimal, autoDiscount: Decimal): Decimal;
}

class PercentCouponStrategy implements DiscountStrategy {
  constructor(
    private readonly discountValue: number,
    private readonly maxDiscount: number | null,
  ) {}

  calculate(_context: PricingContext, subtotal: Decimal, autoDiscount: Decimal): Decimal {
    const baseAmount = subtotal.minus(autoDiscount);
    let discount = baseAmount.mul(this.discountValue).div(100);

    if (this.maxDiscount !== null) {
      const max = new Decimal(this.maxDiscount);
      if (discount.gt(max)) {
        discount = max;
      }
    }

    return Decimal.min(discount, baseAmount);
  }
}

class FixedCouponStrategy implements DiscountStrategy {
  constructor(private readonly discountValue: number) {}

  calculate(_context: PricingContext, subtotal: Decimal, autoDiscount: Decimal): Decimal {
    const baseAmount = subtotal.minus(autoDiscount);
    const discount = new Decimal(this.discountValue);
    return Decimal.min(discount, baseAmount);
  }
}

@Injectable()
export class PricingService {
  calculate(context: PricingContext): PricingResult {
    const pricePerNightDec = new Decimal(context.pricePerNight);
    const nightsDec = new Decimal(context.totalNights);

    // Calculate subtotal = price_per_night * total_nights
    const subtotal = pricePerNightDec.mul(nightsDec);

    // Calculate automatic discount: 10% off for 3+ nights
    let automaticDiscount = new Decimal(0);
    if (context.totalNights >= 3) {
      automaticDiscount = subtotal.mul(10).div(100);
    }

    // Calculate coupon discount using Strategy Pattern
    let couponDiscount = new Decimal(0);
    if (context.coupon) {
      let strategy: DiscountStrategy;
      if (context.coupon.type === 'PERCENT') {
        strategy = new PercentCouponStrategy(
          context.coupon.discountValue,
          context.coupon.maxDiscount,
        );
      } else {
        strategy = new FixedCouponStrategy(context.coupon.discountValue);
      }
      couponDiscount = strategy.calculate(context, subtotal, automaticDiscount);
    }

    const finalPrice = subtotal.minus(automaticDiscount).minus(couponDiscount);

    return {
      subtotal: subtotal.toNumber(),
      automaticDiscount: automaticDiscount.toNumber(),
      couponDiscount: couponDiscount.toNumber(),
      finalPrice: finalPrice.toNumber(),
    };
  }
}
