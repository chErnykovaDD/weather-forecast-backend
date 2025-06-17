import { Provider } from '@nestjs/common';
import { AppMailerService } from '../services/app-mailer.service';

export const mailProviders = 'MAIL_PROVIDER';

export const provider: Provider = {
  provide: mailProviders,
  useClass: AppMailerService,
};
