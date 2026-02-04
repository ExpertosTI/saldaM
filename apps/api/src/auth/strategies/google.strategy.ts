
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
            prompt: 'select_account', // Force account selection every time
            accessType: 'offline',
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
            const { name, emails, photos } = profile;

            const email = emails?.[0]?.value;
            if (!email) {
                done(new Error('Google account missing email'), null);
                return;
            }

            const user = await this.authService.validateGoogleUser({
                email,
                firstName: name?.givenName || 'User',
                lastName: name?.familyName || '',
                picture: photos?.[0]?.value || null,
            });
            done(null, user);
        } catch (err) {
            console.error('Google Strategy Error:', err);
            done(err, null);
        }
    }
}
