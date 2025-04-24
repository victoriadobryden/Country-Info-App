// src/app.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';  
import { CountriesModule } from './countries/countries.module';
import { CalendarModule } from './calendar/calendar.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'demo',
      password: 'demo',
      database: 'country_info',
      autoLoadEntities: true,
      synchronize: true,     
    }),
    CacheModule.register({       
      ttl: 60 * 60,
      isGlobal: true,           
    }),
    HttpModule.register({
      baseURL: 'https://date.nager.at/api/v3',
      timeout: 5000,
    }),
    CountriesModule,
    CalendarModule,
  ],
  exports: [CacheModule],
})
export class AppModule {}



