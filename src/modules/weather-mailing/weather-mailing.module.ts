import { Module } from '@nestjs/common';
import { WeatherMailingService } from './services/weather-mailing.service';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherModule } from '../weather/weather.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { MailModule } from '../mail/mail.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    WeatherModule,
    SubscriptionModule,
    MailModule,
    TokenModule,
  ],
  providers: [WeatherMailingService],
})
export class WeatherMailingModule {}
