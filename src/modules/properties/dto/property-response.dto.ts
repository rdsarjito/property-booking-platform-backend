import { PropertyType } from '../entities/property.entity';

export class RoomResponseDto {
  id!: number;
  name!: string;
  capacity!: number;
  pricePerNight!: number;
  availableUnit!: number;
  totalUnit!: number;
}

export class PropertyResponseDto {
  id!: number;
  name!: string;
  city!: string;
  address!: string;
  type!: PropertyType;
  rating!: number;
  rooms?: RoomResponseDto[];
}
