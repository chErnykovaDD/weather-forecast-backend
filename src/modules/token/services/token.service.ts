import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload } from 'src/modules/token/interfaces/payload.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(authPayload: AuthPayload, expires: string): Promise<string> {
    return this.jwtService.signAsync(authPayload, { expiresIn: expires });
  }

  async verifyToken(token: string): Promise<{ email: string; city: string }> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}
