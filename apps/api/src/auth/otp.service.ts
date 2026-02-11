import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);
    // In-memory storage for MVP. Production should use Redis.
    private otpStore = new Map<string, { code: string; expiresAt: number }>();

    generateOtp(email: string): string {
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        this.otpStore.set(email, { code: otp, expiresAt });
        
        // Cleanup old OTPs (simple garbage collection)
        if (this.otpStore.size > 1000) {
            this.cleanup();
        }

        this.logger.log(`Generated OTP for ${email}`);
        return otp;
    }

    verifyOtp(email: string, code: string): boolean {
        const record = this.otpStore.get(email);
        if (!record) return false;

        if (Date.now() > record.expiresAt) {
            this.otpStore.delete(email);
            return false;
        }

        if (record.code === code) {
            this.otpStore.delete(email); // One-time use
            return true;
        }

        return false;
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, val] of this.otpStore.entries()) {
            if (now > val.expiresAt) {
                this.otpStore.delete(key);
            }
        }
    }
}
