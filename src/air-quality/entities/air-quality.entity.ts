import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class AirQuality {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Paris' })
  @Column()
  city: string;

  @ApiProperty({ example: 48.856613 })
  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @ApiProperty({ example: 2.352222 })
  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @ApiProperty({ example: { aqius: 42, mainus: 'p2', aqicn: 30, maincn: 'p1' }, type: 'object' })
  @Column('json')
  pollution: any; // Store the pollution object as JSON

  @ApiProperty({ example: '2024-06-01T12:00:00.000Z' })
  @CreateDateColumn()
  checkedAt: Date;
}
