import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async validateGoogleUser(details: { email: string; firstName: string; lastName: string; picture: string; accessToken: string }) {
        // Check if user exists
        const user = await this.userService.findOne(details.email);
        if (user) {
            return user; // Log in existing user
        }

        // Create new user (Auto-registration)
        console.log('Creating new user from Google Login:', details.email);
        return this.userService.create({
            email: details.email,
            firstName: details.firstName,
            lastName: details.lastName,
            passwordHash: null,
        });
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            isNewUser: !user.userType, // If userType is null, it's a new or incomplete user
        };
    }
}
