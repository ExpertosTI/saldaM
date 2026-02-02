"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { API_BASE_URL, getToken } from '@/lib/auth';

export default function OnboardingPage() {
    const params = useParams<{ locale: string }>();
    const router = useRouter();
    const t = useTranslations();
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');

    const handleSave = async () => {
        if (!userType) return;
        setLoading(true);
        setMessage('');
        try {
            // Get token from cookie manually since we are in client component
            const token = getToken();

            if (!token) {
                setMessage(t('System.sessionExpired'));
                router.push(`/${params.locale}/login`);
                return;
            }

            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userType }),
            });

            if (res.ok) {
                router.push(`/${params.locale}/dashboard`);
            } else {
                setMessage(t('System.onboardingUpdateFailed'));
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
            <div className="w-full max-w-lg p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden text-center">
                <h2 className="text-3xl font-bold text-primary mb-4 tracking-wider uppercase">{t('System.onboardingTitle')}</h2>
                <p className="text-gray-400 mb-8">{t('System.onboardingSubtitle')}</p>

                <div className="grid grid-cols-1 gap-4 mb-8">
                    {['ARTIST', 'PRODUCER', 'PUBLISHER'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setUserType(type)}
                            className={`p-4 rounded-xl border-2 transition-all font-bold tracking-widest ${userType === type
                                    ? 'bg-primary text-black border-primary scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                    : 'bg-neutral-900 text-gray-400 border-neutral-700 hover:border-gray-500 hover:text-white'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    disabled={!userType || loading}
                    className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? t('System.onboardingSaving') : t('System.onboardingContinue')}
                </button>

                {message && (
                    <div className="mt-4 text-sm text-red-400 font-semibold">{message}</div>
                )}
            </div>
        </main>
    );
}
