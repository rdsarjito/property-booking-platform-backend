import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { IsAfterDate } from '../../../common/decorators/is-after-date.decorator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  customerEmail!: string;

  @IsInt()
  roomId!: number;

  @IsDateString()
  @IsNotEmpty()
  checkInDate!: string;

  @IsDateString()
  @IsNotEmpty()
  @IsAfterDate('checkInDate', {
    message: 'checkOutDate must be after checkInDate',
  })
  checkOutDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  couponCode?: string;
}
