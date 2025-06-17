import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { EmailSettings } from 'src/modules/mail/interfaces/email-settings.interface';

describe('MailService', () => {
  let mailService: MailService;
  let mailerServiceMock: { sendEmail: jest.Mock };

  beforeEach(async () => {
    mailerServiceMock = {
      sendEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: 'MAIL_PROVIDER',
          useValue: mailerServiceMock,
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(mailService).toBeDefined();
  });

  it('should call sendEmail on mailerService with correct settings', async () => {
    const settings: EmailSettings = {
      email: 'test@example.com',
      subject: 'Test subject',
      template: 'template-name',
      context: { key: 'value' },
      token: 'token123',
    };

    await mailService.send(settings);

    expect(mailerServiceMock.sendEmail).toHaveBeenCalledTimes(1);
    expect(mailerServiceMock.sendEmail).toHaveBeenCalledWith(settings);
  });
});
