
'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function JoinPage({ params }: { params: { locale: string; token: string } }) {
    const t = useTranslations('Dashboard'); // Using Dashboard keys for now or common
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'joining' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleJoin = async () => {
        setStatus('joining');
        try {
            // Get token from cookie manually or assume we have it in client?
            // Client components don't auto-send cookies in fetch unless credentials: include?
            // But we store token in cookie 'token'.
            // We need to read it to set Authorization header.

            // Allow basic "document.cookie" read since we are in client component
            const tokenMatch = document.cookie.match(/token=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;

            if (!token) {
                // Redirect to login if not logged in
                router.push(`/${params.locale}/login?returnUrl=/join/${params.token}`);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/split-sheets/join/${params.token}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage('Successfully joined! Redirecting...');
                setTimeout(() => {
                    router.push(`/${params.locale}/dashboard`);
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Failed to join');
            }
        } catch (e) {
            setStatus('error');
            setMessage('An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Join Split Sheet</h1>
                <p className="text-gray-400 mb-8">You have been invited to collaborate on a Split Sheet.</p>

                {status === 'idle' && (
                    <button
                        onClick={handleJoin}
                        className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all"
                    >
                        Accept Invitation
                    </button>
                )}

                {status === 'joining' && (
                    <div className="text-primary font-bold animate-pulse">Joining...</div>
                )}

                {status === 'success' && (
                    <div className="text-green-500 font-bold">{message}</div>
                )}

                {status === 'error' && (
                    <div className="text-red-500 font-bold">{message}</div>
                )}
            </div>
        </div>
    );
}
