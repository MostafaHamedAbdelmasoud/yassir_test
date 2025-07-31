"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirQualityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const air_quality_entity_1 = require("./entities/air-quality.entity");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const cron = __importStar(require("node-cron"));
let AirQualityService = class AirQualityService {
    airQualityRepo;
    httpService;
    constructor(airQualityRepo, httpService) {
        this.airQualityRepo = airQualityRepo;
        this.httpService = httpService;
    }
    onModuleInit() {
        const parisLat = 48.856613;
        const parisLon = 2.352222;
        cron.schedule('* * * * *', async () => {
            try {
                const record = await this.fetchAndSaveAirQuality(parisLat, parisLon);
                console.log(`[CRON] Paris air quality saved at ${record.checkedAt}`);
            }
            catch (e) {
                console.error('[CRON] Failed to fetch Paris air quality:', e.message);
            }
        });
    }
    async fetchAndSaveAirQuality(lat, lon) {
        const apiKey = process.env.IQAIR_API_KEY;
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            const data = response.data;
            if (data.status !== 'success') {
                throw new common_1.HttpException('Failed to fetch air quality', common_1.HttpStatus.BAD_GATEWAY);
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
        }
        catch (error) {
            throw new common_1.HttpException('Error fetching air quality', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async getLatestAirQuality(lat, lon) {
        return this.airQualityRepo.findOne({
            where: { latitude: lat, longitude: lon },
            order: { checkedAt: 'DESC' },
        });
    }
    async getMostPollutedDatetime(lat, lon) {
        return this.airQualityRepo.createQueryBuilder('air_quality')
            .where('air_quality.latitude = :lat', { lat })
            .andWhere('air_quality.longitude = :lon', { lon })
            .orderBy("JSON_EXTRACT(air_quality.pollution, '$.aqius')", 'DESC')
            .getOne();
    }
};
exports.AirQualityService = AirQualityService;
exports.AirQualityService = AirQualityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(air_quality_entity_1.AirQuality)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        axios_1.HttpService])
], AirQualityService);
//# sourceMappingURL=air-quality.service.js.map