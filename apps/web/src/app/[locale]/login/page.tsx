"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

/**
 * Google OAuth Login - Using @react-oauth/google
 * 
 * This approach uses Google's official library which handles all the OAuth complexity:
 * - No manual popup management
 * - No cross-origin issues
 * - Token received directly via callback
 * - Simple POST to backend to exchange for app JWT
 */

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

    // Handle legacy OAuth callback (for backward compatibility with old flow)
    // Handle legacy OAuth callback (keep for backward compatibility if needed, but new flow doesn't use it)
    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) return;

        // Prevent double execution (React StrictMode)
        if (handledRef.current) return;
        handledRef.current = true;

        const isNewUser = searchParams.get('isNewUser') === 'true';

        // Set cookies with proper domain for production
        // In local development (localhost), cookie domain should be unset or localhost
        const hostname = window.location.hostname;
        const isProd = hostname.endsWith('saldanamusic.com');
        const cookieDomain = isProd ? '; Domain=.saldanamusic.com' : '';
        const secureFlag = isProd ? '; Secure' : '';

        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}${secureFlag}`;

        // Put token in localStorage as backup/convenience
        localStorage.setItem('token', token);

        // Redirect based on user status
        if (isNewUser) {
            router.replace(`/${locale}/onboarding`);
        } else {
            router.replace(`/${locale}/dashboard`);
        }
    }, [searchParams, router, locale]);

    /**
     * Handle successful Google login from @react-oauth/google
     */
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            setError('No se recibió credencial de Google');
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Send Google JWT to our backend for verification and app JWT generation
            const response = await fetch(`${API_URL}/auth/google-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Set cookies with proper domain
                const hostname = window.location.hostname;
                const isProd = hostname.endsWith('saldanamusic.com');
                const cookieDomain = isProd ? '; Domain=.saldanamusic.com' : '';
                const secureFlag = isProd ? '; Secure' : '';

                document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}${secureFlag}`;

                // Also save to localStorage for API client usage if needed
                localStorage.setItem('token', data.token);

                // Redirect based on user status
                if (data.isNewUser) {
                    router.push(`/${locale}/onboarding`);
                } else {
                    router.push(`/${locale}/dashboard`);
                }
            } else {
                setError(data.message || data.error || 'Error al autenticar con Google');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('[Login] Google auth error:', err);
            setError('Error de conexión. Intenta de nuevo.');
            setIsLoading(false);
        }
    };

    /**
     * Handle Google login error
     */
    const handleGoogleError = () => {
        setError('Error al conectar con Google');
        setIsLoading(false);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login attempt", email, password);
        router.push(`/${locale}/dashboard`);
    };

    // If handling token callback directly (legacy flow), show loader
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
                    {/* Google Login Button - Uses @react-oauth/google */}
                    {isLoading ? (
                        <div className="w-full flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/80 text-black font-semibold">
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Conectando...
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                theme="filled_black"
                                shape="pill"
                                size="large"
                                text="continue_with"
                                width="320"
                                logo_alignment="left"
                            />
                        </div>
                    )}

                    <div className="relative flex py-2 items-center w-full">
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
