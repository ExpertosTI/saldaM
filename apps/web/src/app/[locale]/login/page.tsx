"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();
    const a = useTranslations('Auth');

    const searchParams = useSearchParams();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder logic for now - Real implementation connects to NestJS
        console.log("Login attempt", email, password);
        router.push(`/${locale}/dashboard`);
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
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Logo & Decorative Gold Glow */}
                <Link href={`/${locale}`} className="flex flex-col items-center mb-8 hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-4" />
                    <div className="w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-3xl font-bold text-center text-primary mb-8 tracking-wider uppercase">{a('login.title')}</h2>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => {
                            const width = 500;
                            const height = 600;
                            const left = window.screen.width / 2 - width / 2;
                            const top = window.screen.height / 2 - height / 2;

                            try {
                                sessionStorage.setItem('saldana_pre_auth_path', `${pathname}${window.location.search}`);
                            } catch { }

                            const popup = window.open(
                                `${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/auth/google`,
                                'Google_Auth',
                                `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`
                            );

                            const pollCookie = () => {
                                const tokenMatch = document.cookie.match(/(?:^|; )token=([^;]+)/);
                                if (!tokenMatch?.[1]) return null;
                                const newUserMatch = document.cookie.match(/(?:^|; )saldana_is_new_user=([^;]+)/);
                                const isNew = newUserMatch?.[1] === '1';
                                return { token: tokenMatch[1], isNewUser: isNew };
                            };

                            const finalizeAuth = (token: string, isNewUser: boolean) => {
                                const cookieDomain = window.location.hostname.endsWith('saldanamusic.com')
                                    ? '; Domain=.saldanamusic.com'
                                    : '';
                                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax; Secure${cookieDomain}`;
                                document.cookie = `saldana_is_new_user=${isNewUser ? '1' : '0'}; path=/; max-age=600; SameSite=Lax; Secure${cookieDomain}`;
                                popup?.close();
                                let preAuthPath: string | null = null;
                                try {
                                    preAuthPath = sessionStorage.getItem('saldana_pre_auth_path');
                                    sessionStorage.removeItem('saldana_pre_auth_path');
                                } catch { }

                                const isLoop = typeof preAuthPath === 'string' && (preAuthPath.includes('/login') || preAuthPath.includes('/register'));

                                if (!isNewUser && preAuthPath && !isLoop) {
                                    router.replace(preAuthPath);
                                } else if (isNewUser) {
                                    router.push(`/${locale}/onboarding`);
                                } else {
                                    router.push(`/${locale}/dashboard/profile`);
                                }
                            };

                            const handleMessage = (event: MessageEvent) => {
                                // Add security check for origin if needed
                                if (!event.origin.endsWith('saldanamusic.com')) return;
                                if (event.data?.token) finalizeOnce(event.data.token, !!event.data.isNewUser);
                            };

                            const handleStorage = (event: StorageEvent) => {
                                if (event.key !== 'saldana_auth' || !event.newValue) return;
                                try {
                                    const data = JSON.parse(event.newValue);
                                    if (data?.token) finalizeOnce(data.token, !!data.isNewUser);
                                } catch { }
                            };

                            const cleanup = () => {
                                window.removeEventListener('message', handleMessage);
                                window.removeEventListener('storage', handleStorage);
                                if (pollId) window.clearInterval(pollId);
                            };

                            const finalizeOnce = (token: string, isNewUser: boolean) => {
                                cleanup();
                                finalizeAuth(token, isNewUser);
                            };

                            window.addEventListener('message', handleMessage);
                            window.addEventListener('storage', handleStorage);

                            const pollId = window.setInterval(() => {
                                const data = pollCookie();
                                if (data?.token) finalizeOnce(data.token, !!data.isNewUser);
                            }, 300);
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        {a('login.continueWithGoogle')}
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-neutral-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">{a('login.orLoginWithEmail')}</span>
                        <div className="flex-grow border-t border-neutral-700"></div>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{a('common.emailLabel')}</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
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
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center text-gray-400 cursor-pointer">
                            <input type="checkbox" className="mr-2 accent-primary" />
                            {a('login.rememberMe')}
                        </label>
                        <a href="#" className="text-primary hover:text-white transition-colors">{a('login.forgotPassword')}</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1"
                    >
                        {a('login.submit')}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    {a('login.noAccount')} <Link href={`/${locale}/register`} className="text-primary hover:underline">{a('login.applyForAccess')}</Link>
                </p>
            </div>
        </main>
    );
}
