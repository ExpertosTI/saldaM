
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Use relative path to allow passport to construct URL based on host header (requires trust proxy)
            callbackURL: '/api/auth/google/callback',
            scope: ['email', 'profile'],
            proxy: true, // Crucial when behind Traefik/Reverse Proxy
        });

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.warn('Google Auth credentials missing. Auth will fail.');
        }
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        try {
            console.log('Google Profile Received:', JSON.stringify(profile)); // Debug Log
            const { name, emails, photos } = profile;

            const user = await this.authService.validateGoogleUser({
                email: emails?.[0]?.value,
                firstName: name?.givenName || 'User',
                lastName: name?.familyName || '',
                picture: photos?.[0]?.value || null,
                accessToken,
            });
            done(null, user);
        } catch (err) {
            console.error('Google Strategy Error:', err);
            done(err, null);
        }
    }
}
