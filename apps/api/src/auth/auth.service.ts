import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) { }

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
            // We might want to store the picture or token if needed, but User entity doesn't have it yet.
            // For MVP, just creating the user is enough.
            passwordHash: null, // No password for Google users
        });
    }
}
