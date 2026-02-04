"use client";

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function AuthCallbackClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const handledRef = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) return;
        if (handledRef.current) return;
        handledRef.current = true;

        const isNewUser = searchParams.get('isNewUser') === 'true';
        const isPopup = window.opener && !window.opener.closed;
        const payload = { token, isNewUser, ts: Date.now() };

        const cookieDomain = window.location.hostname.endsWith('saldanamusic.com')
            ? '; Domain=.saldanamusic.com'
            : '';

        // Set cookies
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax; Secure${cookieDomain}`;
        document.cookie = `saldana_is_new_user=${isNewUser ? '1' : '0'}; path=/; max-age=600; SameSite=Lax; Secure${cookieDomain}`;

        // Store in localStorage for cross-tab detection
        try {
            localStorage.setItem('saldana_auth', JSON.stringify(payload));
        } catch { }

        // If this is a popup, notify opener and close
        if (isPopup) {
            try {
                window.opener.postMessage(payload, '*');
            } catch { }

            // Small delay before closing to ensure message is sent
            setTimeout(() => {
                window.close();
            }, 200);
            return;
        }

        // Not a popup - redirect directly
        let preAuthPath: string | null = null;
        try {
            preAuthPath = sessionStorage.getItem('saldana_pre_auth_path');
            sessionStorage.removeItem('saldana_pre_auth_path');
        } catch { }

        const isLoop = typeof preAuthPath === 'string' && (preAuthPath.includes('/login') || preAuthPath.includes('/register'));

        if (!isNewUser && preAuthPath && !isLoop) {
            router.replace(preAuthPath);
            return;
        }

        const nextPath = isNewUser ? `/${locale}/onboarding` : `/${locale}/dashboard`;
        router.replace(nextPath);
    }, [searchParams, router, pathname, locale]);

    return null;
}
