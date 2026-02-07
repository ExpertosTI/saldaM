import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {
        const clientId = process.env.GOOGLE_CLIENT_ID || '609647959676-acjcpqrq4oghnanp2288f1e9jkf7fnp4.apps.googleusercontent.com';
        // Initialize Google OAuth client for token verification
        this.googleClient = new OAuth2Client(clientId);
    }

    /**
     * Verify Google JWT token from @react-oauth/google frontend library.
     * Returns the user (existing or newly created).
     */
    async verifyGoogleToken(credential: string): Promise<User> {
        const clientId = process.env.GOOGLE_CLIENT_ID || '609647959676-acjcpqrq4oghnanp2288f1e9jkf7fnp4.apps.googleusercontent.com';

        const ticket = await this.googleClient.verifyIdToken({
            idToken: credential,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error('Invalid Google token: no email found');
        }

        const email = payload.email;
        const firstName = payload.given_name || payload.name?.split(' ')[0] || '';
        const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
        const picture = payload.picture || null;

        console.log('[Auth] Google token verified for:', email);

        // Use existing validateGoogleUser logic
        return this.validateGoogleUser({ email, firstName, lastName, picture });
    }

    async validateGoogleUser(details: { email: string; firstName: string; lastName: string; picture: string | null }) {
        console.log('[Auth] Google login attempt:', details.email);

        // Check if user exists
        const user = await this.userService.findOne(details.email);
        if (user) {
            console.log('[Auth] Existing user found:', { id: user.id, email: user.email, userType: user.userType });

            // Always update avatar if Google provides one (keeps it current)
            // Only update name if user hasn't set their own
            const patch: any = {};
            if (!user.firstName && details.firstName) patch.firstName = details.firstName;
            if (!user.lastName && details.lastName) patch.lastName = details.lastName;
            if (details.picture) patch.avatarUrl = details.picture; // Always update avatar

            if (Object.keys(patch).length > 0) {
                console.log('[Auth] Updating user with patch:', patch);
                const updatedUser = await this.userService.updateProfile(user.id, patch);
                console.log('[Auth] User updated:', { id: updatedUser.id, firstName: updatedUser.firstName, avatarUrl: !!updatedUser.avatarUrl });
                return updatedUser;
            }
            return user; // Log in existing user
        }


        // Create new user (Auto-registration)
        console.log('[Auth] Creating new user from Google Login:', details.email);
        const newUser = await this.userService.create({
            email: details.email,
            firstName: details.firstName,
            lastName: details.lastName,
            avatarUrl: details.picture,
            passwordHash: null,
            isEmailVerified: true,
        });
        console.log('[Auth] New user created:', { id: newUser.id, email: newUser.email, firstName: newUser.firstName });
        return newUser;
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
