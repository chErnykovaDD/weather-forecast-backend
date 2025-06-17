import { WeatherData } from './weather-data.interface';

export interface WeatherResponse {
  current: WeatherData;
  location: {
    name: string;
    country: string;
  };
}
