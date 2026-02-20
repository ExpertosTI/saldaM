"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
                    <Image src="/logo.svg" alt="Saldaña Music Logo" width={240} height={64} className="h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-4" />
                    <div className="w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-3xl font-bold text-center text-primary mb-2 tracking-wider uppercase">{a('register.title')}</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">{a('register.subtitle')}</p>

                <div className="mb-6">
                    {/* El inicio de sesión con Google fue eliminado a petición del usuario. */}
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['ARTIST', 'PRODUCER', 'PUBLISHER', 'SONGWRITER'].map((type) => (
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
