import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '../entities/property.entity';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Hotel Grand Indonesia',
    description: 'Property name',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    example: 'Jakarta',
    description: 'City where the property is located',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({
    example: 'Jl. M.H. Thamrin No.1, Jakarta Pusat',
    description: 'Full address of the property',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    example: 'HOTEL',
    description: 'Property type',
    enum: PropertyType,
    enumName: 'PropertyType',
  })
  @IsEnum(PropertyType, {
    message: 'type must be one of: HOTEL, VILLA, APARTMENT, GUEST_HOUSE',
  })
  type!: PropertyType;

  @ApiProperty({
    example: 4.5,
    description: 'Property rating (1.0 - 5.0)',
    minimum: 1.0,
    maximum: 5.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1.0)
  @Max(5.0)
  rating!: number;
}
