import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from '../services/weather.service';
import { WeatherData } from 'src/modules/weather/interfaces/weather-data.interface';

@Controller()
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('weather')
  async findWeather(@Query('city') city: string): Promise<WeatherData> {
    if (!city) {
      throw new BadRequestException('City parameter is required');
    }
    return await this.weatherService.getWeather(city);
  }
}
