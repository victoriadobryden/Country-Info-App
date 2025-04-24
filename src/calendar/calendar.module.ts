// src/calendar/calendar.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { CalendarEvent } from '../entities/calendar-event.entity';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent]),
    HttpModule,
    CacheModule.register(),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
