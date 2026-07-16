import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';

@Controller('properties/:propertyId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async create(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    return this.roomsService.create(propertyId, createRoomDto);
  }

  @Get()
  async findByProperty(
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ): Promise<RoomResponseDto[]> {
    return this.roomsService.findByProperty(propertyId);
  }
}
