"use client";

import { useState, useEffect } from "react";
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

    // Check if user is already logged in
    useEffect(() => {
        const token = getToken();
        if (token && !searchParams.get('logout')) {
            // Verify token is valid
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
        // Clear ALL auth data before starting new OAuth flow
        removeToken();
        document.cookie = 'token=; path=/; max-age=0';
        document.cookie = 'saldana_is_new_user=; path=/; max-age=0';

        // Clear domain-specific cookies
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
        setIsLoading(true);

        // IMPORTANT: Clear all existing auth data first
        clearAuthData();

        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        try {
            sessionStorage.setItem('saldana_pre_auth_path', `${pathname}${window.location.search}`);
        } catch { }

        // Add timestamp to prevent caching and force new auth
        const authUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/auth/google?t=${Date.now()}`;

        const popup = window.open(
            authUrl,
            'Google_Auth',
            `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`
        );

        const finalizeAuth = (token: string, isNewUser: boolean) => {
            const cookieDomain = window.location.hostname.endsWith('saldanamusic.com')
                ? '; Domain=.saldanamusic.com'
                : '';
            document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}`;
            document.cookie = `saldana_is_new_user=${isNewUser ? '1' : '0'}; path=/; max-age=600; SameSite=Lax${cookieDomain}`;

            try {
                localStorage.setItem('saldana_auth', JSON.stringify({ token, isNewUser, ts: Date.now() }));
            } catch { }

            try {
                popup?.close();
            } catch { }

            let preAuthPath: string | null = null;
            try {
                preAuthPath = sessionStorage.getItem('saldana_pre_auth_path');
                sessionStorage.removeItem('saldana_pre_auth_path');
            } catch { }

            const isLoop = typeof preAuthPath === 'string' && (preAuthPath.includes('/login') || preAuthPath.includes('/register'));

            setIsLoading(false);

            if (isNewUser) {
                router.push(`/${locale}/onboarding`);
            } else if (preAuthPath && !isLoop) {
                router.replace(preAuthPath);
            } else {
                router.push(`/${locale}/dashboard`);
            }
        };

        const handleMessage = (event: MessageEvent) => {
            const allowedOrigins = ['saldanamusic.com', 'localhost', '127.0.0.1'];
            const isAllowed = allowedOrigins.some(origin => event.origin.includes(origin));
            if (!isAllowed) return;
            if (event.data?.token) finalizeOnce(event.data.token, !!event.data.isNewUser);
        };

        const handleStorage = (event: StorageEvent) => {
            if (event.key !== 'saldana_auth' || !event.newValue) return;
            try {
                const data = JSON.parse(event.newValue);
                if (data?.token && Date.now() - data.ts < 30000) {
                    finalizeOnce(data.token, !!data.isNewUser);
                }
            } catch { }
        };

        let pollId: number | null = null;
        let finalized = false;

        const cleanup = () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleStorage);
            if (pollId) window.clearInterval(pollId);
        };

        const finalizeOnce = (token: string, isNewUser: boolean) => {
            if (finalized) return;
            finalized = true;
            cleanup();
            finalizeAuth(token, isNewUser);
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleStorage);

        // Poll for popup closed
        pollId = window.setInterval(() => {
            if (popup?.closed) {
                // Wait for cookies/storage to settle
                setTimeout(() => {
                    if (!finalized) {
                        // Check for token in cookies
                        const tokenMatch = document.cookie.match(/(?:^|; )token=([^;]+)/);
                        if (tokenMatch?.[1]) {
                            const newUserMatch = document.cookie.match(/(?:^|; )saldana_is_new_user=([^;]+)/);
                            finalizeOnce(tokenMatch[1], newUserMatch?.[1] === '1');
                        } else {
                            // Check localStorage
                            try {
                                const stored = localStorage.getItem('saldana_auth');
                                if (stored) {
                                    const parsed = JSON.parse(stored);
                                    if (parsed?.token && Date.now() - parsed.ts < 30000) {
                                        finalizeOnce(parsed.token, !!parsed.isNewUser);
                                    }
                                }
                            } catch { }
                        }
                    }
                    cleanup();
                    setIsLoading(false);
                }, 800);
            }
        }, 500);
    };

    // If handling callbacks, show loader only
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
                        className="w-full flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base disabled:opacity-70 disabled:cursor-wait"
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
