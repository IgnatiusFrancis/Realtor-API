import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 9,
    address: '45B Lane',
    city: 'Calabar',
    price: 32,
    property_type: PropertyType,
    image: 'img1',
    number_of_Bedrooms: 4,
    number_of_Bathrooms: 3,
    images: [
      {
        url: 'img4',
      },
    ],
  },
];

const mockHome = {
  id: 9,
  address: '45B Lane',
  city: 'Calabar',
  price: 32,
  property_type: PropertyType,
  image: 'img1',
  number_of_Bedrooms: 4,
  number_of_Bathrooms: 3,
};

const mockImages = [
  {
    id: 1,
    url: 'img1',
  },
  {
    id: 2,
    url: 'img2',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaSrvice: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaSrvice = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Calabar',
      price: {
        gte: 10000,
        lte: 15000,
      },
      PropertyType: PropertyType.CONDO,
    };
    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaSrvice.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: { url: true },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaSrvice.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: '11 Ephraim',
      numberOfBathrooms: 2,
      numberOfBedrooms: 2,
      city: 'Calabar',
      landSize: 222,
      price: 5322,
      propertyType: PropertyType.RESIDENTIAL,
      images: [
        {
          url: 'img3',
        },
      ],
    };
    it('should call prisma home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaSrvice.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 9);

      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: '11 Ephraim',
          number_of_bathrooms: 2,
          number_of_bedrooms: 2,
          city: 'Calabar',
          land_size: 222,
          price: 5322,
          propertyType: PropertyType.RESIDENTIAL,
          realtor_id: 9,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

      jest
        .spyOn(prismaSrvice.image, 'createMany')
        .mockImplementation(mockCreateManyImage);

      await service.createHome(mockCreateHomeParams, 9);

      expect(mockCreateManyImage).toBeCalledWith({
        data: [
          {
            url: 'img3',
            home_id: 9,
          },
        ],
      });
    });
  });
});
