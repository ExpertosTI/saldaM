"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';

/**
 * Google OAuth Login Flow - Best Practices Implementation
 * 
 * Flow:
 * 1. User clicks "Continue with Google"
 * 2. Clear any existing auth cookies/storage (prevents stale token detection)
 * 3. Open popup with Google OAuth URL
 * 4. Listen for:
 *    - postMessage from popup (primary method)
 *    - localStorage change (fallback for cross-origin)
 *    - Cookie polling with delay (backup fallback)
 * 5. On auth success, redirect to dashboard/onboarding
 */

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();
    const a = useTranslations('Auth');
    const searchParams = useSearchParams();
    const handledRef = useRef(false);

    // Handle OAuth callback when this page receives token (popup flow)
    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) return;

        // Prevent double execution (React StrictMode)
        if (handledRef.current) return;
        handledRef.current = true;

        const isNewUser = searchParams.get('isNewUser') === 'true';
        const payload = { token, isNewUser, ts: Date.now() };

        // Detect if running in popup - use window.name (set when popup opened)
        let isPopup = window.name === 'Google_Auth';

        // Fallback: check window.opener
        if (!isPopup) {
            try {
                isPopup = !!(window.opener && !window.opener.closed);
            } catch {
                isPopup = !!window.opener;
            }
        }

        console.log('[LoginPage OAuth Callback] isPopup:', isPopup, 'window.name:', window.name, 'token:', token.substring(0, 20) + '...');

        // Set cookies with proper domain
        const cookieDomain = window.location.hostname.endsWith('saldanamusic.com')
            ? '; Domain=.saldanamusic.com'
            : '';
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}`;
        document.cookie = `saldana_is_new_user=${isNewUser ? '1' : '0'}; path=/; max-age=600; SameSite=Lax${cookieDomain}`;

        // Save to localStorage (for cross-tab detection)
        try {
            localStorage.setItem('saldana_auth', JSON.stringify(payload));
        } catch { }

        // If popup, notify parent and close
        if (isPopup) {
            try {
                // Send token to parent window - use * for cross-origin
                window.opener?.postMessage(payload, '*');
                console.log('[LoginPage] Sent postMessage to parent');
            } catch (e) {
                console.error('[LoginPage] Failed to notify parent:', e);
            }

            // Close popup after small delay
            setTimeout(() => {
                console.log('[LoginPage] Closing popup window');
                window.close();
            }, 500);
            return;
        }

        // Not a popup - redirect directly
        if (isNewUser) {
            router.replace(`/${locale}/onboarding`);
        } else {
            router.replace(`/${locale}/dashboard`);
        }
    }, [searchParams, router, locale]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt", email, password);
        router.push(`/${locale}/dashboard`);
    };

    /**
     * Clear all auth data before starting OAuth flow
     * This prevents stale tokens from triggering premature popup close
     */
    const clearAuthData = () => {
        // Clear cookies (both with and without domain)
        document.cookie = 'token=; path=/; max-age=0';
        document.cookie = 'saldana_is_new_user=; path=/; max-age=0';

        const domain = window.location.hostname.endsWith('saldanamusic.com')
            ? '; Domain=.saldanamusic.com'
            : '';
        document.cookie = `token=; path=/; max-age=0${domain}`;
        document.cookie = `saldana_is_new_user=; path=/; max-age=0${domain}`;

        // Clear localStorage
        try {
            localStorage.removeItem('saldana_auth');
            localStorage.removeItem('token');
        } catch { }

        // Clear sessionStorage (except pre_auth_path which we'll set)
        try {
            sessionStorage.removeItem('sm_loaded');
        } catch { }
    };

    /**
     * Start Google OAuth flow with popup
     */
    const startGoogleAuth = () => {
        if (isLoading) return;
        setIsLoading(true);

        // CRITICAL: Clear existing auth data first
        clearAuthData();

        // Calculate popup position (centered)
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        // Save current path for redirect after auth
        try {
            sessionStorage.setItem('saldana_pre_auth_path', `${pathname}${window.location.search}`);
        } catch { }

        // Open Google OAuth popup
        const popup = window.open(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/auth/google`,
            'Google_Auth',
            `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,resizable=yes,scrollbars=yes`
        );

        if (!popup) {
            setIsLoading(false);
            alert('Por favor habilita las ventanas emergentes para iniciar sesión con Google');
            return;
        }

        let finalized = false;
        let pollId: number | null = null;
        let closedCheckId: number | null = null;

        /**
         * Finalize authentication - redirect user
         */
        const finalizeAuth = (token: string, isNewUser: boolean) => {
            // Set cookies with proper domain
            const cookieDomain = window.location.hostname.endsWith('saldanamusic.com')
                ? '; Domain=.saldanamusic.com'
                : '';
            document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}`;
            document.cookie = `saldana_is_new_user=${isNewUser ? '1' : '0'}; path=/; max-age=600; SameSite=Lax${cookieDomain}`;

            // Save to localStorage as backup
            try {
                localStorage.setItem('saldana_auth', JSON.stringify({ token, isNewUser, ts: Date.now() }));
            } catch { }

            // Close popup
            try {
                popup?.close();
            } catch { }

            // Get pre-auth path for redirect
            let preAuthPath: string | null = null;
            try {
                preAuthPath = sessionStorage.getItem('saldana_pre_auth_path');
                sessionStorage.removeItem('saldana_pre_auth_path');
            } catch { }

            setIsLoading(false);

            // Redirect logic
            const isLoop = typeof preAuthPath === 'string' &&
                (preAuthPath.includes('/login') || preAuthPath.includes('/register'));

            if (isNewUser) {
                router.push(`/${locale}/onboarding`);
            } else if (preAuthPath && !isLoop) {
                router.replace(preAuthPath);
            } else {
                router.push(`/${locale}/dashboard`);
            }
        };

        /**
         * Ensure we only finalize once
         */
        const finalizeOnce = (token: string, isNewUser: boolean) => {
            if (finalized) return;
            finalized = true;
            cleanup();
            finalizeAuth(token, isNewUser);
        };

        /**
         * Cleanup all listeners and intervals
         */
        const cleanup = () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
            if (pollId) clearInterval(pollId);
            if (closedCheckId) clearInterval(closedCheckId);
        };

        /**
         * Handle postMessage from popup (primary auth method)
         */
        const handleMessage = (event: MessageEvent) => {
            // Security: Verify origin (allow production and localhost)
            const allowedOrigins = ['saldanamusic.com', 'localhost', '127.0.0.1'];
            const isAllowed = allowedOrigins.some(origin => event.origin.includes(origin));
            if (!isAllowed) return;

            if (event.data?.token) {
                finalizeOnce(event.data.token, !!event.data.isNewUser);
            }
        };

        /**
         * Handle localStorage change (fallback for cross-origin)
         */
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== 'saldana_auth' || !event.newValue) return;
            try {
                const data = JSON.parse(event.newValue);
                // Only accept recent tokens (within last 60 seconds)
                if (data?.token && data?.ts && (Date.now() - data.ts < 60000)) {
                    finalizeOnce(data.token, !!data.isNewUser);
                }
            } catch { }
        };

        /**
         * Poll for cookie (backup fallback - with delay)
         */
        const pollCookie = () => {
            const tokenMatch = document.cookie.match(/(?:^|; )token=([^;]+)/);
            if (!tokenMatch?.[1]) return null;
            const newUserMatch = document.cookie.match(/(?:^|; )saldana_is_new_user=([^;]+)/);
            return { token: tokenMatch[1], isNewUser: newUserMatch?.[1] === '1' };
        };

        // Register event listeners
        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        // Start cookie polling AFTER A DELAY (gives Google time to load)
        // This prevents detecting stale cookies that might have been set incorrectly
        setTimeout(() => {
            if (finalized) return;
            pollId = window.setInterval(() => {
                const data = pollCookie();
                if (data?.token) {
                    finalizeOnce(data.token, data.isNewUser);
                }
            }, 500); // Poll every 500ms (not too aggressive)
        }, 3000); // Wait 3 seconds before starting to poll

        // Check if popup was closed without completing auth
        closedCheckId = window.setInterval(() => {
            if (popup?.closed) {
                // Popup closed - check if we got auth data
                setTimeout(() => {
                    if (!finalized) {
                        const data = pollCookie();
                        if (data?.token) {
                            finalizeOnce(data.token, data.isNewUser);
                        } else {
                            // User closed popup without completing - cleanup
                            cleanup();
                            setIsLoading(false);
                        }
                    }
                }, 500);
                if (closedCheckId) clearInterval(closedCheckId);
            }
        }, 1000);
    };

    // If handling token callback directly (non-popup flow), show loader
    if (searchParams.get('token')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-primary">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="tracking-widest uppercase text-sm">{a('login.authenticating')}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
            <div className="w-full max-w-md p-6 sm:p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Logo & Decorative Gold Glow */}
                <Link href={`/${locale}`} className="flex flex-col items-center mb-6 sm:mb-8 hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-12 sm:h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-3 sm:mb-4" />
                    <div className="w-20 sm:w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-6 sm:mb-8 tracking-wider uppercase">{a('login.title')}</h2>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={startGoogleAuth}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors text-sm sm:text-base disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                Conectando...
                            </>
                        ) : (
                            <>
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                {a('login.continueWithGoogle')}
                            </>
                        )}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-neutral-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">{a('login.orLoginWithEmail')}</span>
                        <div className="flex-grow border-t border-neutral-700"></div>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{a('common.emailLabel')}</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-600 transition-all text-sm sm:text-base"
                            placeholder={a('login.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{a('common.passwordLabel')}</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-600 transition-all text-sm sm:text-base"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-2">
                        <label className="flex items-center text-gray-400 cursor-pointer">
                            <input type="checkbox" className="mr-2 accent-primary" />
                            {a('login.rememberMe')}
                        </label>
                        <a href="#" className="text-primary hover:text-white transition-colors">{a('login.forgotPassword')}</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 sm:py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1 text-sm sm:text-base"
                    >
                        {a('login.submit')}
                    </button>
                </form>

                <p className="mt-6 sm:mt-8 text-center text-gray-500 text-sm">
                    {a('login.noAccount')} <Link href={`/${locale}/register`} className="text-primary hover:underline">{a('login.applyForAccess')}</Link>
                </p>
            </div>
        </main>
    );
}
