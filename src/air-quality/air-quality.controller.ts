import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AirQualityService } from './air-quality.service';
import { AirQuality } from './entities/air-quality.entity';
import { CoordinatesDto } from './dto/coordinates.dto';

@ApiTags('air-quality')
@Controller('air-quality')
export class AirQualityController {
  constructor(private readonly airQualityService: AirQualityService) {}

  @Get('nearest-city')
  @ApiQuery({ name: 'lat', type: Number, example: 48.856613, required: true })
  @ApiQuery({ name: 'lon', type: Number, example: 2.352222, required: true })
  @ApiOkResponse({ description: 'Latest air quality data', type: AirQuality })
  @ApiBadRequestResponse({ description: 'Invalid latitude or longitude' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getNearestCityAirQuality(@Query() query: CoordinatesDto) {
    const { lat, lon } = query;
    const airQuality = await this.airQualityService.fetchAndSaveAirQuality(lat, lon);
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
    const parisLat = 48.856613;
    const parisLon = 2.352222;
    const record = await this.airQualityService.getMostPollutedDatetime(parisLat, parisLon);
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