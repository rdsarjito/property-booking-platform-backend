import { IsString, IsNotEmpty, IsInt, Min, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    example: 'Deluxe Room',
    description: 'Room type or name',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({
    example: 2,
    description: 'Room capacity (number of people)',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({
    example: 500000,
    description: 'Price per night',
    minimum: 1,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  pricePerNight!: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of units of this room type',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  totalUnit!: number;

  @ApiProperty({
    example: 10,
    description: 'Available units of this room type',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  availableUnit!: number;
}
