import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';  
import { CountriesController } from './countries.controller';

@Module({
  imports: [
    HttpModule,  
    CacheModule.register(),
  ],
  providers: [CountriesService],
  controllers: [CountriesController]
})
export class CountriesModule {}
