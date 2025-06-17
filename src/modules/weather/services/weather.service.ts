import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { WeatherData } from "../interfaces/weather-data.interface";
import { WeatherResponse } from "../interfaces/weather-response.interfase";

@Injectable()
export class WeatherService {
  private apiKey: string;
  private apiBaseUrl: string;
  constructor(private readonly configServise: ConfigService) {
    this.apiKey = this.configServise.get<string>('weather.apiKey')!;
    this.apiBaseUrl = this.configServise.get<string>('weather.url')!;
  }

  async getWeather(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get<WeatherResponse>(
        `${this.apiBaseUrl}/current.json`,
        {
          params: {
            key: this.apiKey,
            q: city,
          },
        },
      );

      return response.data.current;
    } catch (error) {
      console.error(error?.response?.data || error.message);
      throw new NotFoundException(`Weather for "${city}" not found`);
    }
  }
}
