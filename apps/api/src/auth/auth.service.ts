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
            isNewUser: !user.userType,
        };
    }

    async refreshToken(userId: string) {
        const user = await this.userService.findById(userId);
        if (!user) throw new Error('User not found');
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    verifyToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            return { valid: true, payload: decoded };
        } catch (error) {
            return { valid: false, error: 'Invalid or expired token' };
        }
    }

    decodeToken(token: string) {
        try {
            const decoded = this.jwtService.decode(token);
            return { success: true, payload: decoded };
        } catch (error) {
            return { success: false, error: 'Failed to decode token' };
        }
    }
}
