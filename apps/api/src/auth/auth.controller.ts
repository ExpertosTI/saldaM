import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

type RequestWithUser = { user: { id: string } };

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  // Legacy endpoints removed. Use /google-token.

  /**
   * New endpoint for @react-oauth/google frontend.
   * Receives the Google JWT credential directly, verifies it, and returns our app token.
   */
  @Post('google-token')
  async googleTokenAuth(@Body() body: { credential: string }) {
    const { credential } = body;

    if (!credential) {
      throw new HttpException(
        'Google credential is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Verify Google token and get/create user
      const user = await this.authService.verifyGoogleToken(credential);

      // Generate our JWT
      const { access_token, isNewUser } = this.authService.login(user);

      return {
        success: true,
        token: access_token,
        isNewUser,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        'Google token verification failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new HttpException(
        error instanceof Error && error.message
          ? error.message
          : 'Google authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(@Req() req: RequestWithUser) {
    return this.authService.refreshToken(req.user.id);
  }

  @Post('verify')
  verifyToken(@Body() body: { token: string }) {
    return this.authService.verifyToken(body.token);
  }

  @Post('decode')
  decodeToken(@Body() body: { token: string }) {
    return this.authService.decodeToken(body.token);
  }
}
