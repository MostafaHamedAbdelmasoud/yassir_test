import { AirQualityService } from './air-quality.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AirQualityController } from './air-quality.controller';

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
    it('should return error for invalid lat/lon', async () => {
      const result = await controller.getNearestCityAirQuality('abc', 'def');
      expect(result).toEqual({ error: 'Invalid latitude or longitude' });
    });

    it('should call service and return air quality for valid lat/lon', async () => {
      const mockAirQuality = {
        city: 'Test City',
        pollution: { aqius: 42 },
      };
      (service.fetchAndSaveAirQuality as jest.Mock).mockResolvedValue(mockAirQuality);
      const result = await controller.getNearestCityAirQuality('1.23', '4.56');
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
