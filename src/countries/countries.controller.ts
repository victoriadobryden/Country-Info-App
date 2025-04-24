import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService, CountryDto} from './countries.service';
import { CountryInfoDto } from '../dto/country-info.dto';



@Controller('countries')
export class CountriesController {
  constructor(private readonly service: CountriesService) {}

  @Get(':code')
  getInfo(@Param('code') code: string): Promise<CountryInfoDto> {
    return this.service.getCountryInfo(code);
  }

  @Get()
  async findAll(): Promise<CountryDto[]> {
    return this.service.getAvailableCountries();
  }

  
}
