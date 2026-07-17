import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: '982785f1-bfba-4adb-99ba-4379a438d832' })
  propertyId!: string;

  @ApiProperty({ example: 'Deluxe Room' })
  name!: string;

  @ApiProperty({ example: 2 })
  capacity!: number;

  @ApiProperty({ example: 500000 })
  pricePerNight!: number;

  @ApiProperty({ example: 10 })
  totalUnit!: number;

  @ApiProperty({ example: 10 })
  availableUnit!: number;
}
