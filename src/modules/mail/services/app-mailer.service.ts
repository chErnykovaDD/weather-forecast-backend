import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailSettings } from 'src/modules/mail/interfaces/email-settings.interface';
import { IProviderService } from '../interfaces/provider.interface';

@Injectable()
export class AppMailerService implements IProviderService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(settings: EmailSettings): Promise<void> {
    await this.mailerService.sendMail({
      to: settings.email,
      subject: settings.subject,
      template: settings.template,
      context: settings.context,
    });
  }
}
