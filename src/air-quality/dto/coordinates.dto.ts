import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinatesDto {
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  lon: number;
}
