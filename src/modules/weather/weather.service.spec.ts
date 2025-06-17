import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherService } from './services/weather.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WeatherService', () => {
  let service: WeatherService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'WEATHER_API_KEY') return 'test-api-key';
              if (key === 'WEATHER_API_URL') return 'https://api.weatherapi.com/v1';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return weather data on success', async () => {
    const mockWeatherData = {
      current: {
        temp_c: 20,
        humidity: 60,
        condition: {
          text: 'Sunny',
          icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        },
        wind_kph: 15,
        wind_dir: 'NE',
      },
      location: {
        name: 'Kyiv',
        country: 'Ukraine',
      },
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: mockWeatherData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        url: '',
      },
    });

    const result = await service.getWeather('Kyiv');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.weatherapi.com/v1/current.json',
      {
        params: {
          key: 'test-api-key',
          q: 'Kyiv',
        },
      },
    );
    expect(result).toEqual(mockWeatherData.current);
  });

  it('should throw NotFoundException on error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

    await expect(service.getWeather('UnknownCity')).rejects.toMatchObject({
      message: `Weather for "UnknownCity" not found`,
      name: 'NotFoundException',
    });
  });
});
