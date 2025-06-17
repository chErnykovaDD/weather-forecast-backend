import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config/config.module';
import { DatabaseModule } from "./database/database.module";
import { WeatherModule } from "./modules/weather/weather.module";

@Module({
  imports: [AppConfigModule, DatabaseModule,WeatherModule],
})
export class AppModule {}
