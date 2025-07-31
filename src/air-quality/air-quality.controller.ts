import { Controller, Get, Query } from '@nestjs/common';
import { AirQualityService } from './air-quality.service';
import { ApiTags, ApiQuery, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AirQuality } from './entities/air-quality.entity';

@ApiTags('air-quality')
@Controller('air-quality')
export class AirQualityController {
  constructor(private readonly airQualityService: AirQualityService) {}

  @Get('nearest-city')
  @ApiQuery({ name: 'lat', type: String, example: '48.856613', required: true })
  @ApiQuery({ name: 'lon', type: String, example: '2.352222', required: true })
  @ApiOkResponse({ description: 'Latest air quality data', type: AirQuality })
  @ApiBadRequestResponse({ description: 'Invalid latitude or longitude' })
  async getNearestCityAirQuality(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (isNaN(latitude) || isNaN(longitude)) {
      return { error: 'Invalid latitude or longitude' };
    }
    // Fetch and save latest air quality, then return it
    const airQuality = await this.airQualityService.fetchAndSaveAirQuality(latitude, longitude);
    return airQuality;
  }

  @Get('paris/most-polluted')
  @ApiOkResponse({
    description: 'Most polluted record for Paris',
    schema: {
      example: {
        checkedAt: '2024-06-01T12:00:00.000Z',
        aqi: 99,
        pollution: { aqius: 99, pm25: 10 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'No data found for Paris' })
  async getParisMostPolluted() {
    // Paris coordinates
    const parisLat = 48.856613;
    const parisLon = 2.352222;
    // Find the record with the highest AQI (us)
    const record = await this.airQualityService.getMostPollutedDatetime(
      parisLat,
      parisLon,
    );
    if (!record) {
      return { error: 'No data found for Paris' };
    }
    return {
      checkedAt: record.checkedAt,
      aqi: record.pollution.aqius,
      pollution: record.pollution,
    };
  }
}
