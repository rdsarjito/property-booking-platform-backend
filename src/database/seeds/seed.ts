import { AppDataSource } from '../../../data-source';
import { Property, PropertyType } from '../../modules/properties/entities/property.entity';
import { Room } from '../../modules/rooms/entities/room.entity';
import { Coupon, CouponType } from '../../modules/coupons/entities/coupon.entity';

async function run(): Promise<void> {
  console.log('Initializing data source...');
  await AppDataSource.initialize();
  console.log('Data source initialized.');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  console.log('Cleaning existing data...');
  // Disable constraints to truncate cleanly
  await queryRunner.query('TRUNCATE TABLE "booking_status_histories" CASCADE');
  await queryRunner.query('TRUNCATE TABLE "bookings" CASCADE');
  await queryRunner.query('TRUNCATE TABLE "rooms" CASCADE');
  await queryRunner.query('TRUNCATE TABLE "properties" CASCADE');
  await queryRunner.query('TRUNCATE TABLE "coupons" CASCADE');

  console.log('Seeding Coupons...');
  const coupons = [
    AppDataSource.getRepository(Coupon).create({
      code: 'NEWUSER10',
      type: CouponType.PERCENT,
      discountValue: 10.0,
      maxDiscount: 100000.0,
      minTransaction: 500000.0,
      isActive: true,
      validUntil: null,
    }),
    AppDataSource.getRepository(Coupon).create({
      code: 'STAYCATION50',
      type: CouponType.FIXED,
      discountValue: 50000.0,
      maxDiscount: null,
      minTransaction: 300000.0,
      isActive: true,
      validUntil: null,
    }),
  ];
  await AppDataSource.getRepository(Coupon).save(coupons);

  console.log('Seeding Properties...');
  const properties = [
    AppDataSource.getRepository(Property).create({
      name: 'Hotel Grand Indonesia',
      city: 'Jakarta',
      address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat',
      type: PropertyType.HOTEL,
      rating: 4.5,
    }),
    AppDataSource.getRepository(Property).create({
      name: 'Villa Sunset Bali',
      city: 'Bali',
      address: 'Jl. Raya Uluwatu No.99, Pecatu, Badung',
      type: PropertyType.VILLA,
      rating: 4.8,
    }),
    AppDataSource.getRepository(Property).create({
      name: 'Apartment Orchid Bandung',
      city: 'Bandung',
      address: 'Jl. Cihampelas No.120, Bandung',
      type: PropertyType.APARTMENT,
      rating: 4.2,
    }),
  ];
  const savedProperties = await AppDataSource.getRepository(Property).save(properties);

  console.log('Seeding Rooms...');
  const rooms = [
    // Hotel Grand Indonesia rooms
    AppDataSource.getRepository(Room).create({
      propertyId: savedProperties[0].id,
      name: 'Deluxe Room',
      capacity: 2,
      pricePerNight: 500000.0,
      totalUnit: 10,
      availableUnit: 10,
    }),
    AppDataSource.getRepository(Room).create({
      propertyId: savedProperties[0].id,
      name: 'Executive Suite',
      capacity: 4,
      pricePerNight: 1200000.0,
      totalUnit: 3,
      availableUnit: 3,
    }),

    // Villa Sunset Bali rooms
    AppDataSource.getRepository(Room).create({
      propertyId: savedProperties[1].id,
      name: '2-Bedroom Villa',
      capacity: 4,
      pricePerNight: 1500000.0,
      totalUnit: 2,
      availableUnit: 2,
    }),
    AppDataSource.getRepository(Room).create({
      propertyId: savedProperties[1].id,
      name: '3-Bedroom Private Pool Villa',
      capacity: 6,
      pricePerNight: 300000.0, // Let's make it 3.000.000 (3,000,000.00)
      totalUnit: 1,
      availableUnit: 1,
    }),

    // Apartment Orchid Bandung rooms
    AppDataSource.getRepository(Room).create({
      propertyId: savedProperties[2].id,
      name: 'Studio Room',
      capacity: 2,
      pricePerNight: 350000.0,
      totalUnit: 15,
      availableUnit: 15,
    }),
    AppDataSource.getRepository(Room).create({
      propertyId: savedProperties[2].id,
      name: '2-Bedroom Apartment',
      capacity: 4,
      pricePerNight: 700000.0,
      totalUnit: 5,
      availableUnit: 5,
    }),
  ];
  // Fix the 3-Bedroom Private Pool Villa price to 3,000,000
  rooms[3].pricePerNight = 3000000.0;

  await AppDataSource.getRepository(Room).save(rooms);

  console.log('Seeding completed successfully!');
  await queryRunner.release();
  await AppDataSource.destroy();
}

void run().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
