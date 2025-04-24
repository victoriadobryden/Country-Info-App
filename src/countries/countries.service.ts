// src/countries/countries.service.ts
import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import { CountryInfoDto } from '../dto/country-info.dto';

export interface CountryDto {
  countryCode: string;
  name: string;
}

@Injectable()
export class CountriesService {
  private readonly logger = new Logger(CountriesService.name);

  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getAvailableCountries(): Promise<CountryDto[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<CountryDto[]>('/AvailableCountries'),
      );
      return res.data;
    } catch (err) {
      this.logger.error('Date Nager API failed', err);
      // на проді можна підхопити власним filtеr’ом і вернути 502
      throw err;
    }
  }

  async getCountryInfo(code: string): Promise<CountryInfoDto> {
    code = code.toUpperCase();

    /* 0. кеш на 12 годин (щоб не дерти фрі-API зайвий раз) */
    const cacheKey = `country-info-${code}`;
    const cached = await this.cache.get<CountryInfoDto>(cacheKey);
    if (cached) return cached;

    /* 1. базове CountryInfo + список кодів сусідів */
    const { data: nagerData } = await firstValueFrom(
      this.http.get(`https://date.nager.at/api/v3/CountryInfo/${code}`),
    );                                                  // :contentReference[oaicite:0]{index=0}
    if (!nagerData) throw new NotFoundException('Unknown country code');

    /* 2. population */
    const { data: popResp } = await firstValueFrom(
      this.http.post(
        'https://countriesnow.space/api/v0.1/countries/population',      // :contentReference[oaicite:1]{index=1}
        { country: nagerData.commonName || nagerData.name },
      ),
    );
    const population = (popResp?.data?.populationCounts || []).map((p) => ({
      year: Number(p.year),
      value: Number(p.value),
    }));

    /* 3. flag */
    const { data: flagResp } = await firstValueFrom(
      this.http.post(
        'https://countriesnow.space/api/v0.1/countries/flag/images',     // :contentReference[oaicite:2]{index=2}
        { country: nagerData.commonName || nagerData.name },
      ),
    );
    const flagUrl = flagResp?.data?.flag || '';

    /* 4. convert border codes → назви */
    // використовуємо кешований список усіх країн
    const all = await this.getAvailableCountries();
    const borders = (nagerData.borders as string[]).map((c) => ({
      countryCode: c,
      name: all.find((x) => x.countryCode === c)?.name ?? c,
    }));

    const result: CountryInfoDto = {
      countryCode: nagerData.countryCode,
      name: nagerData.name,
      flagUrl,
      borders,
      population,
    };

    await this.cache.set(cacheKey, result, 60 * 60 * 12); // 12 год
    return result;
  }
}

