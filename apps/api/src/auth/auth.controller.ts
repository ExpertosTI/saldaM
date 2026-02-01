import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
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
        // Successful authentication
        const user = req.user;
        const { access_token, isNewUser } = await this.authService.login(user);

        // Redirect to frontend with REAL JWT and new user flag
        res.redirect(`https://app.saldanamusic.com/login?token=${access_token}&isNewUser=${isNewUser}`);
    }
}
