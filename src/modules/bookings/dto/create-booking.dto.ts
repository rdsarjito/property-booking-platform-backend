import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsAfterDate } from '../../../common/decorators/is-after-date.decorator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Name of the customer',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the customer',
    maxLength: 150,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  customerEmail!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID of the room type being booked',
  })
  @IsUUID()
  roomId!: string;

  @ApiProperty({
    example: '2026-07-20',
    description: 'Check-in date (ISO 8601 date string)',
  })
  @IsDateString()
  @IsNotEmpty()
  checkInDate!: string;

  @ApiProperty({
    example: '2026-07-23',
    description: 'Check-out date (ISO 8601 date string). Must be after checkInDate',
  })
  @IsDateString()
  @IsNotEmpty()
  @IsAfterDate('checkInDate', {
    message: 'checkOutDate must be after checkInDate',
  })
  checkOutDate!: string;

  @ApiPropertyOptional({
    example: 'NEWUSER10',
    description: 'Promo code / Coupon code (e.g. NEWUSER10 or STAYCATION50)',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  couponCode?: string;
}
