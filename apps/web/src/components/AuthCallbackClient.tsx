"use client";

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * AuthCallbackClient - Handles OAuth callback when redirected from Google
 * 
 * This component:
 * 1. Detects token in URL params (from Google OAuth redirect)
 * 2. Sets cookies and localStorage
 * 3. Notifies parent window (if popup) via postMessage
 * 4. Closes popup or redirects to dashboard
 */
export default function AuthCallbackClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const handledRef = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) return;

        // Prevent double execution (React StrictMode)
        if (handledRef.current) return;
        handledRef.current = true;

        const isNewUser = searchParams.get('isNewUser') === 'true';
        const payload = { token, isNewUser, ts: Date.now() };

        // Detect if running in popup - use window.name (works cross-origin)
        // The popup was opened with name 'Google_Auth' in login page
        let isPopup = window.name === 'Google_Auth';

        // Fallback: try window.opener (might work same-origin)
        if (!isPopup) {
            try {
                isPopup = !!(window.opener && !window.opener.closed);
            } catch {
                // Cross-origin access blocked, check if opener exists at all
                isPopup = !!window.opener;
            }
        }

        console.log('[AuthCallback] isPopup:', isPopup, 'window.name:', window.name);

        // Set cookie with proper domain
        const cookieDomain = window.location.hostname.endsWith('saldanamusic.com')
            ? '; Domain=.saldanamusic.com'
            : '';

        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}`;
        document.cookie = `saldana_is_new_user=${isNewUser ? '1' : '0'}; path=/; max-age=600; SameSite=Lax${cookieDomain}`;

        // Save to localStorage (for cross-tab detection)
        try {
            localStorage.setItem('saldana_auth', JSON.stringify(payload));
        } catch { }

        // If in popup, notify parent and close
        if (isPopup) {
            try {
                // Send token to parent window
                window.opener.postMessage(payload, '*');
            } catch (e) {
                console.error('Failed to notify parent window:', e);
            }

            // Close popup after a small delay (ensures message is sent)
            setTimeout(() => {
                window.close();
            }, 300);
            return;
        }

        // Not a popup - redirect directly
        let preAuthPath: string | null = null;
        try {
            preAuthPath = sessionStorage.getItem('saldana_pre_auth_path');
            sessionStorage.removeItem('saldana_pre_auth_path');
        } catch { }

        const isLoop = typeof preAuthPath === 'string' &&
            (preAuthPath.includes('/login') || preAuthPath.includes('/register'));

        if (isNewUser) {
            router.replace(`/${locale}/onboarding`);
        } else if (preAuthPath && !isLoop) {
            router.replace(preAuthPath);
        } else {
            router.replace(`/${locale}/dashboard`);
        }
    }, [searchParams, router, locale]);

    return null;
}
