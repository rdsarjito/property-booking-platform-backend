import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertiesService } from './properties.service';
import { Property, PropertyType } from './entities/property.entity';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let repo: Repository<Property>;

  const mockPropertyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      setParameter: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: getRepositoryToken(Property),
          useValue: mockPropertyRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    repo = module.get<Repository<Property>>(getRepositoryToken(Property));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a property', async () => {
      const dto = {
        name: 'Hotel Indigo',
        city: 'Bandung',
        address: 'Jl. Dago',
        type: PropertyType.HOTEL,
        rating: 4.5,
      };

      const expectedEntity = { ...dto, id: 1 };
      mockPropertyRepository.create.mockReturnValue(expectedEntity);
      mockPropertyRepository.save.mockResolvedValue(expectedEntity);

      const result = await service.create(dto);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Hotel Indigo');
      expect(mockPropertyRepository.create).toHaveBeenCalledWith(dto);
      expect(mockPropertyRepository.save).toHaveBeenCalledWith(expectedEntity);
    });
  });
});
