"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const locale = useLocale();
    const a = useTranslations('Auth');
    const searchParams = useSearchParams();
    const handledRef = useRef(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would implement standard email/password authentication via your API
        router.push(`/${locale}/dashboard`);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-background">
            <div className="w-full max-w-md p-6 sm:p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Logo & Decorative Gold Glow */}
                <Link href={`/${locale}`} className="flex flex-col items-center mb-6 sm:mb-8 hover:scale-105 transition-transform cursor-pointer">
                    <Image src="/logo.svg" alt="Saldaña Music Logo" width={220} height={64} className="h-12 sm:h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-3 sm:mb-4" />
                    <div className="w-20 sm:w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-6 sm:mb-8 tracking-wider uppercase">{a('login.title')}</h2>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4 items-center">
                    {/* Google Login was removed natively */}
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
