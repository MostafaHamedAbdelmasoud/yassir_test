import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AirQuality } from './entities/air-quality.entity';
import { HttpService } from '@nestjs/axios';
export declare class AirQualityService implements OnModuleInit {
    private readonly airQualityRepo;
    private readonly httpService;
    constructor(airQualityRepo: Repository<AirQuality>, httpService: HttpService);
    onModuleInit(): void;
    fetchAndSaveAirQuality(lat: number, lon: number): Promise<AirQuality>;
    getLatestAirQuality(lat: number, lon: number): Promise<AirQuality | null>;
    getMostPollutedDatetime(lat: number, lon: number): Promise<AirQuality | null>;
}
