import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = { sub: string; email: string };
type JwtUser = { id: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'saldana_music_fallback_secret_2026',
    });

    if (!configService.get<string>('JWT_SECRET')) {
      this.logger.warn(
        '⚠️ WARNING: Using fallback JWT_SECRET. Please configure JWT_SECRET in production!',
      );
    }
  }

  validate(payload: JwtPayload): JwtUser {
    // This payload comes from the decoded JWT
    // We provide specific user details to the request
    return { id: payload.sub, email: payload.email };
  }
}
