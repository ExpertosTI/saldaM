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
  constructor(private authService: AuthService) { }

  // Google Auth Endpoint Removed during Global Audit

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
