
import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { CalendarEvent } from '../entities/calendar-event.entity';
import { AddHolidaysDto } from '../dto/add-holidays.dto';

@Injectable()
export class CalendarService {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(CalendarEvent)
    private readonly repo: Repository<CalendarEvent>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async addPublicHolidays(userId: string, dto: AddHolidaysDto) {
    const { countryCode, year, holidays } = dto;

    /* 1. кеш-хіт (20 хв) */
    const cacheKey = `holidays-${year}-${countryCode}`;
    let list = await this.cache.get<any[]>(cacheKey);
    if (!list) {
      const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
      const { data } = await firstValueFrom(this.http.get(url));
      list = data;                               // :contentReference[oaicite:1]{index=1}
      await this.cache.set(cacheKey, list, 60 * 20);
    }

    if (!Array.isArray(list) || list.length === 0) {
      throw new NotFoundException('No holidays found');
    }

    /* 2. фільтр за назвами */
    const filtered = holidays?.length
      ? list.filter((h) => holidays.includes(h.name))
      : list;

    if (filtered.length === 0) {
      throw new BadRequestException('Provided names do not match any holiday');
    }

    /* 3. мапінг у сутності */
    const entities = filtered.map<Partial<CalendarEvent>>((h) => ({
      userId,
      date: h.date,          // already ISO-8601
      title: h.name,
      countryCode,
    }));

    /* 4. upsert — ідемпотентність */
    await Promise.all(
      entities.map((e) =>
        this.repo
          .createQueryBuilder()
          .insert()
          .into(CalendarEvent)
          .values(e)
          .onConflict('(userId, date) DO NOTHING')
          .execute(),
      ),
    );

    return { added: entities.length };
  }
}
