import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload } from 'src/modules/token/interfaces/payload.interface';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should call jwtService.signAsync with correct payload and expiry', async () => {
      const payload: AuthPayload = { email: 'test@example.com', city: 'Kyiv' };
      const expires = '1h';
      const token = 'signed-token';

      mockJwtService.signAsync.mockResolvedValue(token);

      const result = await service.generateToken(payload, expires);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, {
        expiresIn: expires,
      });
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('should return decoded token payload when token is valid', async () => {
      const token = 'valid-token';
      const decodedPayload = { email: 'test@example.com', city: 'Kyiv' };

      mockJwtService.verifyAsync.mockResolvedValue(decodedPayload);

      const result = await service.verifyToken(token);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(result).toEqual(decodedPayload);
    });

    it('should throw error when token is invalid or expired', async () => {
      const token = 'invalid-token';

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken(token)).rejects.toThrow(
        'Invalid or expired token',
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
    });
  });
});
