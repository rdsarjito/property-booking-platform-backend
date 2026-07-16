import { IsOptional, IsString, IsEnum, IsNumber, Min, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '../entities/property.entity';
import { IsAfterDate } from '../../../common/decorators/is-after-date.decorator';

export class FilterPropertyDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minCapacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @IsOptional()
  @IsDateString()
  @IsAfterDate('checkInDate', {
    message: 'checkOutDate must be after checkInDate',
  })
  checkOutDate?: string;
}
