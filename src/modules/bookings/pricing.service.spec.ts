import { Test, TestingModule } from '@nestjs/testing';
import { PricingService, PricingContext } from './services/pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate subtotal correctly without discounts', () => {
    const ctx: PricingContext = {
      pricePerNight: 200000,
      totalNights: 2,
      coupon: null,
    };

    const result = service.calculate(ctx);
    expect(result.subtotal).toBe(400000);
    expect(result.automaticDiscount).toBe(0);
    expect(result.couponDiscount).toBe(0);
    expect(result.finalPrice).toBe(400000);
  });

  it('should apply 10% automatic discount for 3 or more nights', () => {
    const ctx: PricingContext = {
      pricePerNight: 200000,
      totalNights: 3,
      coupon: null,
    };

    const result = service.calculate(ctx);
    expect(result.subtotal).toBe(600000);
    expect(result.automaticDiscount).toBe(60000); // 10% of 600,000
    expect(result.couponDiscount).toBe(0);
    expect(result.finalPrice).toBe(540000);
  });

  it('should apply STAYCATION50 fixed coupon (50k off)', () => {
    const ctx: PricingContext = {
      pricePerNight: 200000,
      totalNights: 2,
      coupon: {
        type: 'FIXED',
        discountValue: 50000,
        maxDiscount: null,
      },
    };

    const result = service.calculate(ctx);
    expect(result.subtotal).toBe(400000);
    expect(result.automaticDiscount).toBe(0);
    expect(result.couponDiscount).toBe(50000);
    expect(result.finalPrice).toBe(350000);
  });

  it('should apply NEWUSER10 percent coupon with cap (10% off up to 100k)', () => {
    // Case 1: Under the cap
    const ctx1: PricingContext = {
      pricePerNight: 300000,
      totalNights: 2,
      coupon: {
        type: 'PERCENT',
        discountValue: 10,
        maxDiscount: 100000,
      },
    };

    const res1 = service.calculate(ctx1);
    expect(res1.subtotal).toBe(600000);
    expect(res1.couponDiscount).toBe(60000); // 10% of 600,000
    expect(res1.finalPrice).toBe(540000);

    // Case 2: Exceeding the cap
    const ctx2: PricingContext = {
      pricePerNight: 600000,
      totalNights: 2,
      coupon: {
        type: 'PERCENT',
        discountValue: 10,
        maxDiscount: 100000,
      },
    };

    const res2 = service.calculate(ctx2);
    expect(res2.subtotal).toBe(1200000);
    expect(res2.couponDiscount).toBe(100000); // capped at 100,000 (instead of 120,000)
    expect(res2.finalPrice).toBe(1100000);
  });

  it('should combine automatic discount and percent coupon correctly', () => {
    // 3 nights at 300k = 900k subtotal.
    // Auto discount (10%) = 90k.
    // Remaining = 810k.
    // Coupon NEWUSER10 (10% of 810k) = 81k.
    // Final price = 900k - 90k - 81k = 729k.
    const ctx: PricingContext = {
      pricePerNight: 300000,
      totalNights: 3,
      coupon: {
        type: 'PERCENT',
        discountValue: 10,
        maxDiscount: 100000,
      },
    };

    const result = service.calculate(ctx);
    expect(result.subtotal).toBe(900000);
    expect(result.automaticDiscount).toBe(90000);
    expect(result.couponDiscount).toBe(81000);
    expect(result.finalPrice).toBe(729000);
  });

  it('should prevent coupon discount from exceeding remaining subtotal', () => {
    // Under extreme circumstances, make sure final price is not negative
    const ctx: PricingContext = {
      pricePerNight: 30000,
      totalNights: 1,
      coupon: {
        type: 'FIXED',
        discountValue: 50000, // discount greater than room price
        maxDiscount: null,
      },
    };

    const result = service.calculate(ctx);
    expect(result.subtotal).toBe(30000);
    expect(result.couponDiscount).toBe(30000); // capped at remaining subtotal
    expect(result.finalPrice).toBe(0);
  });
});
