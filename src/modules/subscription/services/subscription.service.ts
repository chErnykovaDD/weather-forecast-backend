import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../../mail/services/mail.service';
import { CreateSubscriptionDTO } from '../dtos/create-subscription.dto';
import { WeatherService } from '../../weather/services/weather.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionAction } from '../enum/subscription.enum';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { TokenService } from '../../token/services/token.service';
import { SendConfirmation } from '../enum/send-email.enum';
import { Frequency } from '../enum/frequency.enum';

@Injectable()
export class SubscriptionService {
  private baseUrl: string;

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly weatherService: WeatherService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('app.url')!;
  }

  async create(subscriptionDto: CreateSubscriptionDTO) {
    const cityExists = await this.validateCity(subscriptionDto.city);
    if (!cityExists) {
      throw new NotFoundException(`City "${subscriptionDto.city}" not found`);
    }
    const existingSubscription = await this.getSubscription(
      subscriptionDto.email,
      subscriptionDto.city,
    );

    const token = await this.tokenService.generateToken(
      {
        email: subscriptionDto.email,
        city: subscriptionDto.city,
      },
      '5m',
    );

    if (existingSubscription?.confirmed) {
      throw new Error('Subscription already confirmed');
    }

    if (existingSubscription) {
      await Promise.all([
        this.subscriptionRepository.update(existingSubscription.id, {
          confirmationToken: token,
        }),
        this.mailService.send({
          email: subscriptionDto.email,
          token,
          subject: SendConfirmation.SUBJECT,
          template: SendConfirmation.TEMPLATE,
          context: {
            verificationLink: `${this.baseUrl}/confirm/${token}`,
          },
        }),
      ]);

      return existingSubscription;
    }

    const [subscription] = await Promise.all([
      this.subscriptionRepository.createSubscription({
        ...subscriptionDto,
        confirmationToken: token,
      }),
      this.mailService.send({
        email: subscriptionDto.email,
        token,
        subject: SendConfirmation.SUBJECT,
        template: SendConfirmation.TEMPLATE,
        context: {
          verificationLink: `${this.baseUrl}/api/confirm/${token}`,
        },
      }),
    ]);
    return subscription;
  }

  async getSubscription(email: string, city: string) {
    return this.subscriptionRepository.getSubscriptionEmailCity(email, city);
  }

  async findByFrequency(frequency: Frequency) {
    return this.subscriptionRepository.find({
      where: { confirmed: true, frequency },
    });
  }

  async manageSubscription(token: string, options: SubscriptionAction) {
    const decoded = await this.tokenService.verifyToken(token);
    const { email, city } = decoded;

    const subscription = await this.getSubscription(email, city);

    if (!subscription) {
      throw new NotFoundException('Subscription not found or city mismatch');
    }

    const confirmed = options === SubscriptionAction.CONFIRM;

    await this.subscriptionRepository.save({
      ...subscription,
      confirmed: confirmed,
    });

    return true;
  }

  private async validateCity(city: string) {
    try {
      const weatherData = await this.weatherService.getWeather(city);
      return !!weatherData;
    } catch (error) {
      console.error(`Failed to verify city "${city}": ${error}`);
    }
  }
}
