import { Injectable, HttpException, HttpStatus, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AirQuality } from './entities/air-quality.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cron from 'node-cron';

@Injectable()
export class AirQualityService implements OnModuleInit {
  constructor(
    @InjectRepository(AirQuality)
    private readonly airQualityRepo: Repository<AirQuality>,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit() {
    // Paris coordinates
    const parisLat = 48.856613;
    const parisLon = 2.352222;
    cron.schedule('* * * * *', async () => {
      try {
        const record = await this.fetchAndSaveAirQuality(parisLat, parisLon);
        console.log(`[CRON] Paris air quality saved at ${record.checkedAt}`);
      } catch (e) {
        console.error('[CRON] Failed to fetch Paris air quality:', e.message);
      }
    });
  }

  async fetchAndSaveAirQuality(lat: number, lon: number): Promise<AirQuality> {
    const apiKey = process.env.IQAIR_API_KEY;
    const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const data = response.data;
      if (data.status !== 'success') {
        throw new HttpException('Failed to fetch air quality', HttpStatus.BAD_GATEWAY);
      }
      const city = data.data.city;
      const pollution = data.data.current.pollution;
      const airQuality = this.airQualityRepo.create({
        city,
        latitude: lat,
        longitude: lon,
        pollution,
      });
      return await this.airQualityRepo.save(airQuality);
    } catch (error) {
      throw new HttpException('Error fetching air quality', HttpStatus.BAD_GATEWAY);
    }
  }

  async getLatestAirQuality(lat: number, lon: number): Promise<AirQuality | null> {
    return this.airQualityRepo.findOne({
      where: { latitude: lat, longitude: lon },
      order: { checkedAt: 'DESC' },
    });
  }

  async getMostPollutedDatetime(lat: number, lon: number): Promise<AirQuality | null> {
    // Use query builder to order by AQI (us) inside the JSON pollution column
    return this.airQualityRepo.createQueryBuilder('air_quality')
      .where('air_quality.latitude = :lat', { lat })
      .andWhere('air_quality.longitude = :lon', { lon })
      .orderBy("JSON_EXTRACT(air_quality.pollution, '$.aqius')", 'DESC')
      .getOne();
  }
}
