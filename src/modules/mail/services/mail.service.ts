import { Inject, Injectable } from '@nestjs/common';
import { EmailSettings } from 'src/modules/mail/interfaces/email-settings.interface';
import { IProviderService } from '../interfaces/provider.interface';
import { mailProviders } from '../providers/mail.provider';

@Injectable()
export class MailService {
  constructor(
    @Inject(mailProviders) private mailerService: IProviderService,
  ) {}

  async send(settings: EmailSettings): Promise<void> {
    await this.mailerService.sendEmail(settings);
  }
}
