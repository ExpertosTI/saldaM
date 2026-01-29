"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder logic for now - Real implementation connects to NestJS
        console.log("Login attempt", email, password);
        router.push("/dashboard");
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Decorative Gold Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-primary shadow-[0_0_30px_5px_rgba(212,175,55,0.6)]"></div>

                <h2 className="text-3xl font-bold text-center text-primary mb-8 tracking-wider">MEMBER ACCESS</h2>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.saldanamusic.com'}/auth/google`}
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
