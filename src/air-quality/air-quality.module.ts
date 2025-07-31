import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirQualityService } from './air-quality.service';
import { AirQualityController } from './air-quality.controller';
import { AirQuality } from './entities/air-quality.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([AirQuality])],
  controllers: [AirQualityController],
  providers: [AirQualityService],
})
export class AirQualityModule {}
