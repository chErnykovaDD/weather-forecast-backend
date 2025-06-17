import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config/config.module';
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [AppConfigModule, DatabaseModule],
})
export class AppModule {}
