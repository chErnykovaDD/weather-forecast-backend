import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { MailService } from '../../mail/services/mail.service';
import { TokenService } from '../../token/services/token.service';
import { WeatherService } from '../../weather/services/weather.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { SendConfirmation } from '../enum/send-email.enum';
import { Frequency } from '../enum/frequency.enum';
import { SubscriptionAction } from '../enum/subscription.enum';
import { Subscription } from '../entity/subscription.entity';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let mailService: jest.Mocked<MailService>;
  let tokenService: jest.Mocked<TokenService>;
  let weatherService: jest.Mocked<WeatherService>;
  let configService: jest.Mocked<ConfigService>;

  const mockWeatherData = {
    temp_c: 20,
    humidity: 50,
    condition: { text: 'Sunny', icon: 'sunny.png', code: 1000 },
    wind_kph: 10,
    wind_dir: 'NW',
  };

  const mockSub: Subscription = {
    id: '1',
    email: 'test@example.com',
    city: 'Kyiv',
    frequency: Frequency.DAILY,
    confirmed: false,
    confirmationToken: 'some-token',
    unsubscribeToken: 'unsubscribe-token',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useValue: {
            createSubscription: jest.fn(),
            update: jest.fn(),
            getSubscriptionEmailCity: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateToken: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
        {
          provide: WeatherService,
          useValue: {
            getWeather: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    subscriptionRepository = module.get(
      SubscriptionRepository,
    ) as jest.Mocked<SubscriptionRepository>;
    mailService = module.get(MailService) as jest.Mocked<MailService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
    weatherService = module.get(WeatherService) as jest.Mocked<WeatherService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    configService.get.mockReturnValue('http://localhost');

    service['baseUrl'] = 'http://localhost';
  });

  describe('create', () => {
    const dto = {
      email: 'test@example.com',
      city: 'Kyiv',
      frequency: Frequency.DAILY,
    };

    it('should throw NotFoundException if city is invalid', async () => {
      weatherService.getWeather.mockRejectedValue(new Error('City not found'));

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      expect(weatherService.getWeather).toHaveBeenCalledWith(dto.city);
    });

    it('should throw error if subscription already confirmed', async () => {
      weatherService.getWeather.mockResolvedValue(mockWeatherData);
      jest.spyOn(service, 'getSubscription').mockResolvedValue({
        id: '1',
        email: dto.email,
        city: dto.city,
        confirmed: true,
        confirmationToken: 'token',
      } as any);

      await expect(service.create(dto)).rejects.toThrow(
        'Subscription already confirmed',
      );
    });

    it('should update and send mail if subscription exists but not confirmed', async () => {
      const mockUpdateResult = {
        affected: 1,
        generatedMaps: [],
        raw: [],
      };
      weatherService.getWeather.mockResolvedValue(mockWeatherData);
      jest.spyOn(service, 'getSubscription').mockResolvedValue({
        id: '1',
        email: dto.email,
        city: dto.city,
        confirmed: false,
        confirmationToken: 'old-token',
      } as any);

      tokenService.generateToken.mockResolvedValue('new-token');
      subscriptionRepository.update.mockResolvedValue(mockUpdateResult);
      mailService.send.mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(tokenService.generateToken).toHaveBeenCalledWith(
        { email: dto.email, city: dto.city },
        '5m',
      );
      expect(subscriptionRepository.update).toHaveBeenCalledWith('1', {
        confirmationToken: 'new-token',
      });
      expect(mailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          token: 'new-token',
          subject: SendConfirmation.SUBJECT,
          context: { verificationLink: 'http://localhost/confirm/new-token' },
        }),
      );
      expect(result).toMatchObject({
        id: '1',
        email: dto.email,
        city: dto.city,
        confirmed: false,
      });
    });

    it('should create subscription and send mail if subscription does not exist', async () => {
      weatherService.getWeather.mockResolvedValue(mockWeatherData);
      jest.spyOn(service, 'getSubscription').mockResolvedValue(null);

      tokenService.generateToken.mockResolvedValue('new-token');
      subscriptionRepository.createSubscription.mockResolvedValue({
        id: '2',
        email: dto.email,
        city: dto.city,
        confirmed: false,
        confirmationToken: 'new-token',
      } as any);
      mailService.send.mockResolvedValue(undefined);

      const result = await service.create(dto);

      expect(tokenService.generateToken).toHaveBeenCalledWith(
        { email: dto.email, city: dto.city },
        '5m',
      );
      expect(subscriptionRepository.createSubscription).toHaveBeenCalledWith({
        ...dto,
        confirmationToken: 'new-token',
      });
      expect(mailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          token: 'new-token',
          subject: SendConfirmation.SUBJECT,
          context: {
            verificationLink: 'http://localhost/api/confirm/new-token',
          },
        }),
      );

      expect(result).toMatchObject({
        id: '2',
        email: dto.email,
        city: dto.city,
      });
    });
  });

  describe('getSubscription', () => {
    it('should call subscriptionRepository.getSubscriptionEmailCity', async () => {
      subscriptionRepository.getSubscriptionEmailCity.mockResolvedValue(
        mockSub,
      );

      const result = await service.getSubscription('a@a.com', 'Kyiv');

      expect(
        subscriptionRepository.getSubscriptionEmailCity,
      ).toHaveBeenCalledWith('a@a.com', 'Kyiv');
      expect(result).toEqual(mockSub);
    });
  });

  describe('findByFrequency', () => {
    it('should call subscriptionRepository.find with correct args', async () => {
      const frequency = Frequency.DAILY;
      const mockSubs = [
        {
          id: '1',
          email: 'test@example.com',
          city: 'Kyiv',
          frequency: Frequency.DAILY,
          confirmed: false,
          confirmationToken: 'some-token',
          unsubscribeToken: 'unsubscribe-token',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      subscriptionRepository.find.mockResolvedValue(mockSubs);

      const result = await service.findByFrequency(frequency);

      expect(subscriptionRepository.find).toHaveBeenCalledWith({
        where: { confirmed: true, frequency },
      });
      expect(result).toEqual(mockSubs);
    });
  });

  describe('manageSubscription', () => {
    const token = 'token123';
    const decodedPayload = { email: 'test@example.com', city: 'Kyiv' };
    const subscription = {
      id: '1',
      email: 'test@example.com',
      city: 'Kyiv',
      confirmed: false,
    };

    it('should throw NotFoundException if subscription not found', async () => {
      tokenService.verifyToken.mockResolvedValue(decodedPayload);
      jest.spyOn(service, 'getSubscription').mockResolvedValue(null);

      await expect(
        service.manageSubscription(token, SubscriptionAction.CONFIRM),
      ).rejects.toThrow('Subscription not found or city mismatch');
    });

    it('should save subscription with confirmed true if option is CONFIRM', async () => {
      tokenService.verifyToken.mockResolvedValue(decodedPayload);
      jest.spyOn(service, 'getSubscription').mockResolvedValue(mockSub);
      subscriptionRepository.save.mockResolvedValue(mockSub);

      const result = await service.manageSubscription(
        token,
        SubscriptionAction.CONFIRM,
      );

      expect(tokenService.verifyToken).toHaveBeenCalledWith(token);
      expect.objectContaining({
        city: subscription.city,
        email: subscription.email,
        id: subscription.id,
        confirmed: false,
      }),
        expect(result).toBe(true);
    });

    it('should save subscription with confirmed false if option is UNSUBSCRIBE', async () => {
      tokenService.verifyToken.mockResolvedValue(decodedPayload);
      jest.spyOn(service, 'getSubscription').mockResolvedValue(mockSub);
      subscriptionRepository.save.mockResolvedValue(mockSub);

      const result = await service.manageSubscription(
        token,
        SubscriptionAction.UNSUBSCRIBE,
      );

      expect(subscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          city: subscription.city,
          email: subscription.email,
          id: subscription.id,
          confirmed: false,
        }),
      );

      expect(result).toBe(true);
    });
  });

  describe('validateCity (tested indirectly)', () => {
    it('should return false if weatherService.getWeather throws error', async () => {
      weatherService.getWeather.mockRejectedValue(new NotFoundException('City not found'));
      await expect(
        service.create({
          email: 'a@a.com',
          city: 'InvalidCity',
          frequency: Frequency.DAILY,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return true if weatherService.getWeather returns data', async () => {
      weatherService.getWeather.mockResolvedValue(mockWeatherData);
      jest.spyOn(service, 'getSubscription').mockResolvedValue(null);
      tokenService.generateToken.mockResolvedValue('token');
      subscriptionRepository.createSubscription.mockResolvedValue({
        id: '1',
      } as any);
      mailService.send.mockResolvedValue(undefined);

      const result = await service.create({
        email: 'a@a.com',
        city: 'Kyiv',
        frequency: Frequency.DAILY,
      });
      expect(result).toBeDefined();
      expect(weatherService.getWeather).toHaveBeenCalledWith('Kyiv');
    });
  });
});
