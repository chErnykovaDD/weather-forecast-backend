import { Module } from '@nestjs/common';
import { WeatherController } from './controllers/weather.controller';
import { WeatherService } from './services/weather.service';
import { AppConfigModule } from 'src/config/app-config/config.module';

@Module({
  imports: [AppConfigModule],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
