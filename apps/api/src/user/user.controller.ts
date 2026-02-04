import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    create(@Body() body: any) {
        return this.userService.create(body);
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async getMe(@Req() req: any) {
        console.log('[Users] GET /me - User ID from token:', req.user?.id);
        const user = await this.userService.findById(req.user.id);
        console.log('[Users] User data:', { id: user.id, email: user.email, firstName: user.firstName, userType: user.userType });
        return user;
    }

    @Get(':email')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('email') email: string, @Req() req: any) {
        // Security: Only allow users to fetch their own data
        if (req.user.email !== email) {
            throw new ForbiddenException('Unauthorized: You can only access your own profile');
        }
        return this.userService.findOne(email);
    }

    @Patch('profile')
    @UseGuards(AuthGuard('jwt'))
    updateProfile(@Req() req: any, @Body() body: any) {
        return this.userService.updateProfile(req.user.id, body);
    }

    @Delete('account')
    @UseGuards(AuthGuard('jwt'))
    deleteAccount(@Req() req: any) {
        return this.userService.deleteAccount(req.user.id);
    }

    @Post('change-password')
    @UseGuards(AuthGuard('jwt'))
    changePassword(@Req() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
        return this.userService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    }
}
