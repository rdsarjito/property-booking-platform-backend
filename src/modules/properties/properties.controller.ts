import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createPropertyDto: CreatePropertyDto): Promise<PropertyResponseDto> {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get properties with filtering and pagination',
    description:
      'Supports pagination (offset and cursor) and filters like city, price, capacity, and date availability.',
  })
  @ApiResponse({ status: 200, description: 'List of properties returned' })
  async findAll(@Query() filter: FilterPropertyDto): Promise<unknown> {
    return this.propertiesService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property detail with available rooms' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({
    status: 200,
    description: 'Property detail returned',
    type: PropertyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PropertyResponseDto> {
    return this.propertiesService.findOne(id);
  }
}
