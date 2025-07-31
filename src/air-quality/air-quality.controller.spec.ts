import { AirQualityService } from './air-quality.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AirQualityController } from './air-quality.controller';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CoordinatesDto } from './dto/coordinates.dto';
import { plainToInstance } from 'class-transformer';

describe('AirQualityController', () => {
  let controller: AirQualityController;
  let service: AirQualityService;

  beforeEach(async () => {
    const mockService = {
      fetchAndSaveAirQuality: jest.fn(),
      getMostPollutedDatetime: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirQualityController],
      providers: [{ provide: AirQualityService, useValue: mockService }],
    }).compile();

    controller = module.get<AirQualityController>(AirQualityController);
    service = module.get<AirQualityService>(AirQualityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNearestCityAirQuality', () => {
    it('should throw BadRequestException for invalid lat/lon', async () => {
      const pipe = new ValidationPipe({ transform: true });
      const invalidDto = plainToInstance(CoordinatesDto, {
        lat: 'invalid',
        lon: 2.35,
      });
    
      await expect(
        pipe.transform(invalidDto, { type: 'query', metatype: CoordinatesDto }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call service and return air quality for valid lat/lon', async () => {
      const mockAirQuality = {
        city: 'Test City',
        pollution: { aqius: 42 },
      };
      (service.fetchAndSaveAirQuality as jest.Mock).mockResolvedValue(mockAirQuality);
    
      const result = await controller.getNearestCityAirQuality({ lat: 1.23, lon: 4.56 });
      expect(service.fetchAndSaveAirQuality).toHaveBeenCalledWith(1.23, 4.56);
      expect(result).toBe(mockAirQuality);
    });
  });

  describe('getParisMostPolluted', () => {
    it('should return error if no data found', async () => {
      (service.getMostPollutedDatetime as jest.Mock).mockResolvedValue(null);
      const result = await controller.getParisMostPolluted();
      expect(result).toEqual({ error: 'No data found for Paris' });
    });

    it('should return most polluted record for Paris', async () => {
      const mockRecord = {
        checkedAt: new Date(),
        pollution: { aqius: 99, pm25: 10 },
      };
      (service.getMostPollutedDatetime as jest.Mock).mockResolvedValue(mockRecord);
      const result = await controller.getParisMostPolluted();
      expect(result).toMatchObject({
        checkedAt: mockRecord.checkedAt,
        aqi: mockRecord.pollution.aqius,
        pollution: mockRecord.pollution,
      });
    });
  });
});
