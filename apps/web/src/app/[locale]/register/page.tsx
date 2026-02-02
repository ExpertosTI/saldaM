"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        userType: "ARTIST", // Default
    });
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const t = useTranslations();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                // Redirect to login or kyc
                router.push(`/${locale}/login?registered=true`);
            } else {
                setMessage(t('System.registrationFailed'));
            }
        } catch (error) {
            console.error(error);
            setMessage(t('System.genericError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-lg p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Logo & Decorative Gold Glow */}
                <Link href="/" className="flex flex-col items-center mb-6 hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-4" />
                    <div className="w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-3xl font-bold text-center text-primary mb-2 tracking-wider uppercase">JOIN THE ROSTER</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">Professional Access for Music Creators</p>

                <div className="mb-6 flex flex-col gap-3">
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
                        Sign up with Google
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-neutral-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">OR REGISTER WITH EMAIL</span>
                        <div className="flex-grow border-t border-neutral-700"></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">First Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Last Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">I am a...</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['ARTIST', 'PRODUCER', 'PUBLISHER'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, userType: type })}
                                    className={`py-2 px-1 rounded border text-xs font-bold transition-all ${formData.userType === type
                                        ? 'bg-primary text-black border-primary'
                                        : 'bg-transparent text-gray-400 border-neutral-700 hover:border-gray-500'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-primary text-black font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500 transition-all"
                    >
                        {loading ? 'Creating Profile...' : 'Create Account'}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 text-sm font-semibold text-red-400">{message}</div>
                )}

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Already have an account? <Link href={`/${locale}/login`} className="text-primary hover:underline">Sign In</Link>
                </p>
            </div>
        </main>
    );
}
