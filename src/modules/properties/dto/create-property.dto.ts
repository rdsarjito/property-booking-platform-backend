import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { PropertyType } from '../entities/property.entity';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsEnum(PropertyType, {
    message: 'type must be one of: HOTEL, VILLA, APARTMENT, GUEST_HOUSE',
  })
  type!: PropertyType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1.0)
  @Max(5.0)
  rating!: number;
}
