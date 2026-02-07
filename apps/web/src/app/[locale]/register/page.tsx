"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { GoogleLogin } from '@react-oauth/google';

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
    const a = useTranslations('Auth');

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
                <Link href={`/${locale}`} className="flex flex-col items-center mb-6 hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-4" />
                    <div className="w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-3xl font-bold text-center text-primary mb-2 tracking-wider uppercase">{a('register.title')}</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">{a('register.subtitle')}</p>

                <div className="mb-6 flex flex-col gap-4 items-center">
                    {/* Google Login Button - Uses @react-oauth/google */}
                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                if (credentialResponse.credential) {
                                    // Reuse login flow logic or call register endpoint?
                                    // Usually Google Login is "Register or Login"
                                    // We redirect to Login page with internal logic or handle here.
                                    // Simplest: Redirect to Login page which handles Google Token
                                    console.log('Google Sign Up Success', credentialResponse);

                                    // To properly register with specific userType, we might need a custom flow using the token.
                                    // For now, let's auto-login via the Login page logic which handles creation:
                                    // But wait, Login page auto-creates user with default type logic. 
                                    // If we want to Capture "Artist/Producer" type, we need to pass it.
                                    // The AuthService.validateGoogleUser doesn't take userType. 
                                    // It defaults to UserRole.USER.

                                    // Plan: Use the same Google Token Endpoint.
                                    // If we need to set UserType, we might need to update the User AFTER creation.
                                    // For now, redirecting to Login is the safest "Quick Fix" to get them into the system.

                                    // BETTER: Call the login endpoint here, get the token, then update the user profile with the selected type if it's a new user.
                                    // But to obtain the token we need to call the API.

                                    setLoading(true);
                                    try {
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/auth/google-token`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ credential: credentialResponse.credential })
                                        });
                                        const data = await res.json();
                                        if (res.ok && data.token) {
                                            const hostname = window.location.hostname;
                                            const isProd = hostname.endsWith('saldanamusic.com');
                                            const cookieDomain = isProd ? '; Domain=.saldanamusic.com' : '';
                                            const secureFlag = isProd ? '; Secure' : '';

                                            document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax${cookieDomain}${secureFlag}`;

                                            // Handle User Type Update if New User
                                            if (data.isNewUser) {
                                                // Call API to update user type
                                                // We need an endpoint for this, or just redirect to Onboarding.
                                                router.push(`/${locale}/onboarding`);
                                            } else {
                                                router.push(`/${locale}/dashboard`);
                                            }
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        setMessage('Error al conectar con Google');
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            onError={() => setMessage('Error al conectar con Google')}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            text="signup_with"
                            width="320"
                            logo_alignment="left"
                        />
                    </div>

                    <div className="relative flex py-2 items-center w-full">
                        <div className="flex-grow border-t border-neutral-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">{a('register.orRegisterWithEmail')}</span>
                        <div className="flex-grow border-t border-neutral-700"></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{a('common.firstNameLabel')}</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{a('common.lastNameLabel')}</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{a('register.iAmA')}</label>
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
                                    {a(`register.userType.${type}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{a('common.emailLabel')}</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">{a('common.passwordLabel')}</label>
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
                        {loading ? a('register.creatingProfile') : a('register.createAccount')}
                    </button>
                </form>

                {message && (
                    <div className="mt-4 text-sm font-semibold text-red-400">{message}</div>
                )}

                <p className="mt-8 text-center text-gray-500 text-sm">
                    {a('register.alreadyHaveAccount')} <Link href={`/${locale}/login`} className="text-primary hover:underline">{a('register.signIn')}</Link>
                </p>
            </div>
        </main>
    );
}
