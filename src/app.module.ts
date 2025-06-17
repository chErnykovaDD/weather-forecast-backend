import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config/config.module';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { WeatherModule } from './modules/weather/weather.module';
import { WeatherMailingModule } from './modules/weather-mailing/weather-mailing.module';


@Module({
    imports: [
        AppConfigModule,
        DatabaseModule,
        SubscriptionModule,
        WeatherModule,
        WeatherMailingModule,
    ],
})
export class AppModule {}
