import { AirQualityService } from './air-quality.service';
export declare class AirQualityController {
    private readonly airQualityService;
    constructor(airQualityService: AirQualityService);
    getNearestCityAirQuality(lat: string, lon: string): Promise<import("./entities/air-quality.entity").AirQuality | {
        error: string;
    }>;
    getParisMostPolluted(): Promise<{
        error: string;
        checkedAt?: undefined;
        aqi?: undefined;
        pollution?: undefined;
    } | {
        checkedAt: Date;
        aqi: any;
        pollution: any;
        error?: undefined;
    }>;
}
