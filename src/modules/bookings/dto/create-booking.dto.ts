import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  MaxLength,
  IsUUID,
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

  @IsUUID()
  roomId!: string;

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
