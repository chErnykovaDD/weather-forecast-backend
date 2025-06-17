export interface WeatherData {
  temp_c: number;
  humidity: number;
  condition: {
    text: string;
    icon: string;
  };
  wind_kph: number;
  wind_dir: string;
}
