import { Controller, Get, Post, Body, Req, UseGuards, Res } from '@nestjs/common';
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
