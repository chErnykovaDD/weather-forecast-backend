import { EmailSettings } from 'src/modules/mail/interfaces/email-settings.interface';

export interface IProviderService {
  sendEmail(settings: EmailSettings): Promise<void>;
}
