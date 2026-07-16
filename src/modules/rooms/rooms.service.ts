import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { PropertiesService } from '../properties/properties.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly propertiesService: PropertiesService,
  ) {}

  async create(propertyId: number, createRoomDto: CreateRoomDto): Promise<RoomResponseDto> {
    // 1. Validate property existence (will throw 404 if not found)
    await this.propertiesService.findOne(propertyId);

    // 2. Validate availableUnit <= totalUnit
    if (createRoomDto.availableUnit > createRoomDto.totalUnit) {
      throw new BadRequestException('availableUnit cannot be greater than totalUnit');
    }

    const room = this.roomRepository.create({
      ...createRoomDto,
      propertyId,
    });

    const saved = await this.roomRepository.save(room);
    return this.mapToResponse(saved);
  }

  async findByProperty(propertyId: number): Promise<RoomResponseDto[]> {
    // Validate property existence
    await this.propertiesService.findOne(propertyId);

    const rooms = await this.roomRepository.find({
      where: { propertyId },
    });

    return rooms.map((r) => this.mapToResponse(r));
  }

  private mapToResponse(room: Room): RoomResponseDto {
    return {
      id: room.id,
      propertyId: room.propertyId,
      name: room.name,
      capacity: room.capacity,
      pricePerNight: room.pricePerNight,
      totalUnit: room.totalUnit,
      availableUnit: room.availableUnit,
    };
  }
}
