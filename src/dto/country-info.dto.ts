export interface CountryInfoDto {
    countryCode: string;
    name: string;
    flagUrl: string;
    borders: { countryCode: string; name: string }[];
    population: { year: number; value: number }[];
  }
  