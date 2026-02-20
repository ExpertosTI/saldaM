import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  // Google Auth Logic Removed during Global Audit

  login(user: {
    id: string;
    email: string;
    userType?: User['userType'] | null;
  }) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      isNewUser: !user.userType,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new Error('User not found');
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  verifyToken(token: string) {
    try {
      const decoded: unknown = (
        this.jwtService.verify as unknown as (
          this: JwtService,
          t: string,
        ) => unknown
      ).call(this.jwtService, token) as unknown;
      return { valid: true as const, payload: decoded };
    } catch {
      return { valid: false as const, error: 'Invalid or expired token' };
    }
  }

  decodeToken(token: string) {
    try {
      const decoded: unknown = (
        this.jwtService.decode as unknown as (
          this: JwtService,
          t: string,
        ) => unknown
      ).call(this.jwtService, token) as unknown;
      return { success: true as const, payload: decoded };
    } catch {
      return { success: false as const, error: 'Failed to decode token' };
    }
  }
}
