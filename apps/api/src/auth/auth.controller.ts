import { Controller, Get, Post, Body, Req, UseGuards, Res, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res) {
        const user = req.user;
        const { access_token, isNewUser } = await this.authService.login(user);
        res.redirect(`https://app.saldanamusic.com/login?token=${access_token}&isNewUser=${isNewUser}`);
    }

    /**
     * New endpoint for @react-oauth/google frontend.
     * Receives the Google JWT credential directly, verifies it, and returns our app token.
     */
    @Post('google-token')
    async googleTokenAuth(@Body() body: { credential: string }) {
        const { credential } = body;

        if (!credential) {
            throw new HttpException('Google credential is required', HttpStatus.BAD_REQUEST);
        }

        try {
            // Verify Google token and get/create user
            const user = await this.authService.verifyGoogleToken(credential);

            // Generate our JWT
            const { access_token, isNewUser } = await this.authService.login(user);

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
                }
            };
        } catch (error) {
            console.error('[Auth] Google token verification failed:', error.message);
            throw new HttpException(
                error.message || 'Google authentication failed',
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    @Post('refresh')
    @UseGuards(AuthGuard('jwt'))
    async refreshToken(@Req() req) {
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
