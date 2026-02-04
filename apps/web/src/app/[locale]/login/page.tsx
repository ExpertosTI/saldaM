"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { removeToken, getToken } from '@/lib/auth';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();
    const a = useTranslations('Auth');
    const searchParams = useSearchParams();
    const popupRef = useRef<Window | null>(null);

    // Check if user is already logged in (only on mount)
    useEffect(() => {
        const token = getToken();
        // Only auto-redirect if NOT coming from logout and token exists
        if (token && !searchParams.get('logout') && !searchParams.get('force')) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => {
                if (res.ok) {
                    router.replace(`/${locale}/dashboard`);
                }
            }).catch(() => { });
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt", email, password);
        router.push(`/${locale}/dashboard`);
    };

    const clearAuthData = () => {
        removeToken();
        document.cookie = 'token=; path=/; max-age=0';
        document.cookie = 'saldana_is_new_user=; path=/; max-age=0';

        const domain = window.location.hostname.endsWith('saldanamusic.com')
            ? '; Domain=.saldanamusic.com'
            : '';
        document.cookie = `token=; path=/; max-age=0${domain}`;
        document.cookie = `saldana_is_new_user=; path=/; max-age=0${domain}`;

        try {
            localStorage.removeItem('saldana_auth');
            sessionStorage.removeItem('sm_loaded');
        } catch { }
    };

    const startGoogleAuth = () => {
        if (isLoading) return;

        setIsLoading(true);
        clearAuthData();

        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        try {
            sessionStorage.setItem('saldana_pre_auth_path', `${pathname}${window.location.search}`);
        } catch { }

        const authUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/auth/google`;

        popupRef.current = window.open(
            authUrl,
            'Google_Auth',
            `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,resizable=yes`
        );

        // Handle message from popup
        const handleMessage = (event: MessageEvent) => {
            const allowedOrigins = ['saldanamusic.com', 'localhost', '127.0.0.1'];
            const isAllowed = allowedOrigins.some(origin => event.origin.includes(origin));
            if (!isAllowed) return;

            if (event.data?.token) {
                cleanup();
                handleAuthSuccess(event.data.token, !!event.data.isNewUser);
            }
        };

        // Handle storage event (backup for cross-origin)
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== 'saldana_auth' || !event.newValue) return;
            try {
                const data = JSON.parse(event.newValue);
                if (data?.token && Date.now() - data.ts < 60000) {
                    cleanup();
                    handleAuthSuccess(data.token, !!data.isNewUser);
                }
            } catch { }
        };

        // Handle popup close without auth
        let checkClosedInterval: number | null = null;
        const checkPopupClosed = () => {
            if (popupRef.current?.closed) {
                // Wait a moment for any pending messages/storage events
                setTimeout(() => {
                    // Check if we got auth data
                    const tokenMatch = document.cookie.match(/(?:^|; )token=([^;]+)/);
                    if (tokenMatch?.[1]) {
                        const newUserMatch = document.cookie.match(/(?:^|; )saldana_is_new_user=([^;]+)/);
                        cleanup();
                        handleAuthSuccess(tokenMatch[1], newUserMatch?.[1] === '1');
                    } else {
                        // No auth - user closed popup
                        cleanup();
                        setIsLoading(false);
                    }
                }, 500);
            }
        };

        const cleanup = () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
            if (checkClosedInterval) clearInterval(checkClosedInterval);
        };

        const handleAuthSuccess = (token: string, isNewUser: boolean) => {
            const cookieDomain = window.location.hostname.endsWith('saldanamusic.com')
                ? '; Domain=.saldanamusic.com'
                : '';
            document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}`;

            setIsLoading(false);

            if (isNewUser) {
                router.push(`/${locale}/onboarding`);
            } else {
                router.push(`/${locale}/dashboard`);
            }
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);
        checkClosedInterval = window.setInterval(checkPopupClosed, 1000);
    };

    // If handling callbacks, show loader
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
                <Link href={`/${locale}`} className="flex flex-col items-center mb-6 sm:mb-8 hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-12 sm:h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-3 sm:mb-4" />
                    <div className="w-20 sm:w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-6 sm:mb-8 tracking-wider uppercase">{a('login.title')}</h2>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={startGoogleAuth}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors text-sm sm:text-base disabled:opacity-70"
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
