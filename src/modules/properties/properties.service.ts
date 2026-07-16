import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyResponseDto, RoomResponseDto } from './dto/property-response.dto';
import { PaginationHelper } from '../../common/helpers/pagination.helper';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto): Promise<PropertyResponseDto> {
    const property = this.propertyRepository.create(createPropertyDto);
    const saved = await this.propertyRepository.save(property);
    return this.mapToResponse(saved);
  }

  async findAll(filter: FilterPropertyDto): Promise<unknown> {
    const qb = this.propertyRepository.createQueryBuilder('property');

    // Always join rooms to apply room-level filters and return them
    qb.leftJoinAndSelect('property.rooms', 'room');

    // 1. City filter (case-insensitive partial match)
    if (filter.city) {
      qb.andWhere('LOWER(property.city) LIKE LOWER(:city)', {
        city: `%${filter.city}%`,
      });
    }

    // 2. Type filter
    if (filter.type) {
      qb.andWhere('property.type = :type', { type: filter.type });
    }

    // 3. Rating filter
    if (filter.minRating) {
      qb.andWhere('property.rating >= :minRating', {
        minRating: filter.minRating,
      });
    }

    // 4. Room price and capacity filters
    if (filter.maxPrice) {
      qb.andWhere('room.pricePerNight <= :maxPrice', {
        maxPrice: filter.maxPrice,
      });
    }

    if (filter.minCapacity) {
      qb.andWhere('room.capacity >= :minCapacity', {
        minCapacity: filter.minCapacity,
      });
    }

    // 5. Date availability filter (Exclude properties with rooms fully booked in range)
    if (filter.checkInDate && filter.checkOutDate) {
      qb.andWhere((sub) => {
        const subQuery = sub
          .subQuery()
          .select('r.id')
          .from(Room, 'r')
          .leftJoin(
            'bookings',
            'b',
            "b.room_id = r.id AND b.status IN ('PENDING', 'PAID') AND b.check_in_date < :checkOutDate AND b.check_out_date > :checkInDate",
          )
          .groupBy('r.id, r.total_unit')
          .having('r.total_unit - COUNT(b.id) <= 0');

        return 'room.id NOT IN ' + subQuery.getQuery();
      });
      qb.setParameter('checkInDate', filter.checkInDate);
      qb.setParameter('checkOutDate', filter.checkOutDate);
    }

    // Sorting by ID is required for consistent pagination
    qb.orderBy('property.id', 'ASC');

    // 6. Pagination handling
    if (filter.cursor) {
      const decodedId = PaginationHelper.decodeCursor(filter.cursor);
      if (decodedId !== null) {
        qb.andWhere('property.id > :decodedId', { decodedId });
      }

      const limit = filter.limit ?? 10;
      // Fetch limit + 1 to check if there is a next page
      qb.take(limit + 1);

      const results = await qb.getMany();
      const hasNextPage = results.length > limit;
      const data = hasNextPage ? results.slice(0, -1) : results;

      let nextCursor: string | null = null;
      if (hasNextPage && data.length > 0) {
        nextCursor = PaginationHelper.encodeCursor(data[data.length - 1].id);
      }

      return {
        data: data.map((p) => this.mapToResponse(p)),
        meta: {
          limit,
          nextCursor,
          hasNextPage,
        },
      };
    } else {
      // Offset pagination
      const page = filter.page ?? 1;
      const limit = filter.limit ?? 10;
      const offset = (page - 1) * limit;

      qb.skip(offset).take(limit);

      // Using getManyAndCount to get both total and results
      const [results, total] = await qb.getManyAndCount();
      const meta = PaginationHelper.buildOffsetMeta(total, page, limit);

      return {
        data: results.map((p) => this.mapToResponse(p)),
        meta,
      };
    }
  }

  async findOne(id: number): Promise<PropertyResponseDto> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['rooms'],
    });

    if (!property) {
      throw new NotFoundException(`Property with id ${id} not found`);
    }

    return this.mapToResponse(property);
  }

  private mapToResponse(property: Property): PropertyResponseDto {
    const dto = new PropertyResponseDto();
    dto.id = property.id;
    dto.name = property.name;
    dto.city = property.city;
    dto.address = property.address;
    dto.type = property.type;
    dto.rating = property.rating;

    if (property.rooms) {
      dto.rooms = property.rooms.map((room) => {
        const rDto = new RoomResponseDto();
        rDto.id = room.id;
        rDto.name = room.name;
        rDto.capacity = room.capacity;
        rDto.pricePerNight = room.pricePerNight;
        rDto.availableUnit = room.availableUnit;
        rDto.totalUnit = room.totalUnit;
        return rDto;
      });
    }

    return dto;
  }
}
