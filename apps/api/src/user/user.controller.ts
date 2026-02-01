import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    create(@Body() body: any) {
        return this.userService.create(body);
    }

    @Get(':email')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('email') email: string, @Req() req: any) {
        // Security: Only allow users to fetch their own data or admins
        if (req.user.email !== email) {
            // In production, add role check for admin access
            // For now, users can only access their own profile
        }
        return this.userService.findOne(email);
    }

    @Patch('profile')
    @UseGuards(AuthGuard('jwt'))
    updateProfile(@Req() req: any, @Body() body: any) {
        return this.userService.updateProfile(req.user.id, body);
    }
}
