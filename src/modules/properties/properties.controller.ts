import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PropertyResponseDto } from './dto/property-response.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async create(@Body() createPropertyDto: CreatePropertyDto): Promise<PropertyResponseDto> {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get()
  async findAll(@Query() filter: FilterPropertyDto): Promise<unknown> {
    return this.propertiesService.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PropertyResponseDto> {
    return this.propertiesService.findOne(id);
  }
}
