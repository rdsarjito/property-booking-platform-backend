import { IsString, IsNotEmpty, IsInt, Min, IsNumber, MaxLength } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  pricePerNight!: number;

  @IsInt()
  @Min(1)
  totalUnit!: number;

  @IsInt()
  @Min(0)
  availableUnit!: number;
}
