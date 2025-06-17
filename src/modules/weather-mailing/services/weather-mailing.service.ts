import { Injectable } from '@nestjs/common';
import { WeatherService } from '../../weather/services/weather.service';
import { MailService } from '../../mail/services/mail.service';
import { SubscriptionService } from '../../subscription/services/subscription.service';
import { Cron } from '@nestjs/schedule';
import { Frequency } from '../../subscription/enum/frequency.enum';
import { TokenService } from '../../token/services/token.service';
import { ExpiresTime } from '../../token/enum/time.enum';
import { SendUnSubscribe } from '../../subscription/enum/send-email.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherMailingService {
  private baseUrl: string;
  constructor(
    private readonly weatherService: WeatherService,
    private readonly mailService: MailService,
    private readonly subscriptionService: SubscriptionService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('app.url')!;
  }

  private async sendWeatherByFrequency(frequency: Frequency) {
    const subs = await this.subscriptionService.findByFrequency(frequency);

    for (const sub of subs) {
      const weather = await this.weatherService.getWeather(sub.city);
      const payload = {
        email: sub.email,
        city: sub.city,
      };
      const token = await this.tokenService.generateToken(
        payload,
        ExpiresTime.UNSUBSCRIBE_TIME,
      );

      await this.mailService.send({
        email: sub.email,
        token: sub.confirmationToken,
        subject: SendUnSubscribe.SUBJECT,
        template: SendUnSubscribe.TEMPLATE,
        context: {
          city: sub.city,
          temperature: weather?.temp_c,
          humidity: weather?.humidity,
          description: weather?.condition.text,
          unsubscribeLink: `${this.baseUrl}/unsubscribe/${token}`,
        },
      });
    }
  }
  
  @Cron('0 * * * *')
  async handleEveryFullHour() {
    await this.sendWeatherByFrequency(Frequency.HOURLY);
  }

  @Cron('0 8 * * *')
  async handleDaily() {
    await this.sendWeatherByFrequency(Frequency.DAILY);
  }
}
