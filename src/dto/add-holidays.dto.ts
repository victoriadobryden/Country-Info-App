import { IsISO31661Alpha2, IsInt, Min, Max, IsArray, IsOptional, IsString } from 'class-validator';

export class AddHolidaysDto {
  @IsISO31661Alpha2()
  countryCode: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  holidays?: string[];    // список назв, за якими будемо фільтрувати
}