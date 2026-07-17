import { PropertyType } from '../entities/property.entity';

export class RoomResponseDto {
  id!: string;
  name!: string;
  capacity!: number;
  pricePerNight!: number;
  availableUnit!: number;
  totalUnit!: number;
}

export class PropertyResponseDto {
  id!: string;
  name!: string;
  city!: string;
  address!: string;
  type!: PropertyType;
  rating!: number;
  rooms?: RoomResponseDto[];
}
