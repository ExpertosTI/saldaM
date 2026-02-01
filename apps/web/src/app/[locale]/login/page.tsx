"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const isNewUser = searchParams.get('isNewUser') === 'true';

        if (token) {
            // If we have a token and a window opener (we are a popup)
            if (window.opener) {
                // Send to any origin since we might be on app. subdomain talking to root domain
                window.opener.postMessage({ token, isNewUser }, "*");
                window.close();
            } else {
                // If we are not a popup (e.g. direct link), set cookie and go to dashboard
                document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
                router.push(isNewUser ? '/onboarding' : '/dashboard/profile');
            }
        }
    }, [searchParams, router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder logic for now - Real implementation connects to NestJS
        console.log("Login attempt", email, password);
        router.push("/dashboard");
    };

    // If handling callbacks, show loader only
    if (searchParams.get('token')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-primary">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="tracking-widest uppercase text-sm">Authenticating...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Logo & Decorative Gold Glow */}
                <Link href="/" className="flex flex-col items-center mb-8 hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-4" />
                    <div className="w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-3xl font-bold text-center text-primary mb-8 tracking-wider uppercase">MEMBER ACCESS</h2>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => {
                            const width = 500;
                            const height = 600;
                            const left = window.screen.width / 2 - width / 2;
                            const top = window.screen.height / 2 - height / 2;

                            const popup = window.open(
                                `${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/auth/google`,
                                'Google_Auth',
                                `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`
                            );

                            const handleMessage = (event: MessageEvent) => {
                                // Add security check for origin if needed
                                if (event.data?.token) {
                                    // SAVE TOKEN COOKIE
                                    document.cookie = `token=${event.data.token}; path=/; max-age=86400; SameSite=Lax`;

                                    popup?.close();

                                    if (event.data.isNewUser) {
                                        router.push('/onboarding');
                                    } else {
                                        router.push('/dashboard/profile');
                                    }

                                    window.removeEventListener('message', handleMessage);
                                }
                            };
                            window.addEventListener('message', handleMessage);
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Continuar con Google
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-neutral-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">O ingresa con tu email</span>
                        <div className="flex-grow border-t border-neutral-700"></div>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-600 transition-all"
                            placeholder="you@saldanamusic.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
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
                            Remember me
                        </label>
                        <a href="#" className="text-primary hover:text-white transition-colors">Forgot Password?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-1"
                    >
                        Enter Portal
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    New to Saldaña Music? <Link href="/register" className="text-primary hover:underline">Apply for Access</Link>
                </p>
            </div>
        </main>
    );
}
