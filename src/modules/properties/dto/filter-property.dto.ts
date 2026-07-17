import { IsOptional, IsString, IsEnum, IsNumber, Min, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '../entities/property.entity';
import { IsAfterDate } from '../../../common/decorators/is-after-date.decorator';

export class FilterPropertyDto {
  @ApiPropertyOptional({ example: 'Jakarta', description: 'Filter by city name' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'HOTEL',
    description: 'Filter by property type',
    enum: PropertyType,
    enumName: 'PropertyType',
  })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiPropertyOptional({ example: 4.0, description: 'Minimum rating (1.0 - 5.0)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @ApiPropertyOptional({ example: 600000, description: 'Maximum room price per night' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: 2, description: 'Minimum room capacity' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minCapacity?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page number (offset pagination)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Cursor for cursor-based pagination (base64 encoded UUID)',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    example: '2026-07-20',
    description: 'Check-in date (ISO 8601 format) for availability filtering',
  })
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-22',
    description: 'Check-out date (ISO 8601). Must be after checkInDate',
  })
  @IsOptional()
  @IsDateString()
  @IsAfterDate('checkInDate', {
    message: 'checkOutDate must be after checkInDate',
  })
  checkOutDate?: string;
}
