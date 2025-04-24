// src/calendar/calendar.controller.ts
import { Controller, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { AddHolidaysDto } from '../dto/add-holidays.dto'; 

@Controller('users/:userId/calendar')
export class CalendarController {
  constructor(private readonly service: CalendarService) {}

  @Post('holidays')
  addHolidays(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AddHolidaysDto,
  ) {
    return this.service.addPublicHolidays(userId, dto);
  }
}
