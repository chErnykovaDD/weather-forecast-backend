import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { provider } from './providers/mail.provider';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AppConfigModule } from 'src/config/app-config/config.module';

@Module({
  imports: [
    AppConfigModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('mail.host'),
          port: Number(config.get('mail.port')),
          auth: {
            user: config.get('mail.user'),
            pass: config.get('mail.pass'),
          },
        },
        defaults: {
          from: `"Weather App" <${config.get('mail.user')}>`,
        },
        template: {
          dir: path.join(process.cwd(), 'templates'),
          adapter: new PugAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService, provider],
  exports: [MailService],
})
export class MailModule {}
