import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    create(@Body() body: any) {
        return this.userService.create(body);
    }

    @Get(':email')
    findOne(@Param('email') email: string) {
        return this.userService.findOne(email);
    }
}
