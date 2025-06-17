import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entity/subscription.entity';
import { SubscriptionController } from './controllers/subscription.controller';
import { SubscriptionService } from './services/subscription.service';
import { WeatherModule } from '../weather/weather.module';
import { TokenModule } from '../token/token.module';
import { SubscriptionRepository } from './repository/subscription.repository';

@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([Subscription]),
    TokenModule,
    WeatherModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
