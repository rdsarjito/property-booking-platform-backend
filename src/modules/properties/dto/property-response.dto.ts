import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '../entities/property.entity';

export class RoomResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Deluxe Room' })
  name!: string;

  @ApiProperty({ example: 2 })
  capacity!: number;

  @ApiProperty({ example: 500000 })
  pricePerNight!: number;

  @ApiProperty({ example: 10 })
  availableUnit!: number;

  @ApiProperty({ example: 10 })
  totalUnit!: number;
}

export class PropertyResponseDto {
  @ApiProperty({ example: '982785f1-bfba-4adb-99ba-4379a438d832' })
  id!: string;

  @ApiProperty({ example: 'Hotel Grand Indonesia' })
  name!: string;

  @ApiProperty({ example: 'Jakarta' })
  city!: string;

  @ApiProperty({ example: 'Jl. M.H. Thamrin No.1, Jakarta Pusat' })
  address!: string;

  @ApiProperty({ example: 'HOTEL', enum: PropertyType })
  type!: PropertyType;

  @ApiProperty({ example: 4.5 })
  rating!: number;

  @ApiProperty({ type: [RoomResponseDto], required: false })
  rooms?: RoomResponseDto[];
}
