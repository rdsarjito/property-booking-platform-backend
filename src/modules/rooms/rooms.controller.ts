import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomResponseDto } from './dto/room-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Rooms')
@Controller('properties/:propertyId/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room for a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async create(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<RoomResponseDto> {
    return this.roomsService.create(propertyId, createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms of a property' })
  @ApiParam({ name: 'propertyId', description: 'ID of the property' })
  @ApiResponse({
    status: 200,
    description: 'List of rooms returned',
    type: [RoomResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findByProperty(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
  ): Promise<RoomResponseDto[]> {
    return this.roomsService.findByProperty(propertyId);
  }
}
