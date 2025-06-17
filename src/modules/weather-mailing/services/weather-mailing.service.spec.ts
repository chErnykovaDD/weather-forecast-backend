import { Test, TestingModule } from '@nestjs/testing';
import { SendUnSubscribe } from '../../subscription/enum/send-email.enum';
import { WeatherMailingService } from './../services/weather-mailing.service';
import { WeatherService } from '../../weather/services/weather.service';
import { MailService } from '../../mail/services/mail.service';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import { TokenService } from '../../token/services/token.service';
import { ConfigService } from '@nestjs/config';
import { Frequency } from '../../subscription/enum/frequency.enum';
import { ExpiresTime } from '../../token/enum/time.enum';

describe('WeatherMailingService', () => {
  let service: WeatherMailingService;
  let weatherService: jest.Mocked<WeatherService>;
  let mailService: jest.Mocked<MailService>;
  let subscriptionService: jest.Mocked<SubscriptionService>;
  let tokenService: jest.Mocked<TokenService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherMailingService,
        {
          provide: WeatherService,
          useValue: { getWeather: jest.fn() },
        },
        {
          provide: MailService,
          useValue: { send: jest.fn() },
        },
        {
          provide: SubscriptionService,
          useValue: { findByFrequency: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: { generateToken: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WeatherMailingService>(WeatherMailingService);
    weatherService = module.get(WeatherService);
    mailService = module.get(MailService);
    subscriptionService = module.get(SubscriptionService);
    tokenService = module.get(TokenService);
    configService = module.get(ConfigService);
    configService.get.mockReturnValue('http://localhost');

    service['baseUrl'] = 'http://localhost';
  });

  describe('sendWeatherByFrequency', () => {
    it('should send emails for each subscription', async () => {
      const mockSubs = [
        {
          id: '1',
          email: 'test1@example.com',
          city: 'Kyiv',
          confirmationToken: 'conf-token-1',
          frequency: Frequency.DAILY,
          confirmed: true,
          unsubscribeToken: 'some-token',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'test2@example.com',
          city: 'Lviv',
          confirmationToken: 'conf-token-2',
          frequency: Frequency.HOURLY,
          confirmed: true,
          unsubscribeToken: 'some-token',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      subscriptionService.findByFrequency.mockResolvedValue(mockSubs);
      weatherService.getWeather.mockImplementation(async (city) => {
        return {
          temp_c: city === 'Kyiv' ? 20 : 15,
          humidity: 50,
          condition: {
            text: 'Sunny',
            icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
          },
          wind_kph: 10,
          wind_dir: 'N',
        };
      });
      tokenService.generateToken.mockResolvedValue('token123');

      await service['sendWeatherByFrequency'](Frequency.DAILY);

      expect(subscriptionService.findByFrequency).toHaveBeenCalledWith(
        Frequency.DAILY,
      );
      expect(weatherService.getWeather).toHaveBeenCalledTimes(mockSubs.length);
      expect(weatherService.getWeather).toHaveBeenCalledWith('Kyiv');
      expect(weatherService.getWeather).toHaveBeenCalledWith('Lviv');

      expect(tokenService.generateToken).toHaveBeenCalledTimes(mockSubs.length);
      expect(tokenService.generateToken).toHaveBeenCalledWith(
        { email: 'test1@example.com', city: 'Kyiv' },
        ExpiresTime.UNSUBSCRIBE_TIME,
      );

      expect(mailService.send).toHaveBeenCalledTimes(mockSubs.length);
      expect(mailService.send).toHaveBeenCalledWith({
        email: 'test1@example.com',
        token: 'conf-token-1',
        subject: SendUnSubscribe.SUBJECT,
        template: SendUnSubscribe.TEMPLATE,
        context: expect.objectContaining({
          city: 'Kyiv',
          temperature: 20,
          humidity: 50,
          description: 'Sunny',
          unsubscribeLink: 'http://localhost/unsubscribe/token123',
        }),
      });
    });
  });

  describe('handleEveryHour', () => {
    it('should call sendWeatherByFrequency with HOURLY', async () => {
      const spy = jest
        .spyOn(service as any, 'sendWeatherByFrequency')
        .mockResolvedValue(undefined);
      await service.handleEveryHour();
      expect(spy).toHaveBeenCalledWith(Frequency.HOURLY);
    });
  });

  describe('handleDaily', () => {
    it('should call sendWeatherByFrequency with DAILY', async () => {
      const spy = jest
        .spyOn(service as any, 'sendWeatherByFrequency')
        .mockResolvedValue(undefined);
      await service.handleDaily();
      expect(spy).toHaveBeenCalledWith(Frequency.DAILY);
    });
  });
});
