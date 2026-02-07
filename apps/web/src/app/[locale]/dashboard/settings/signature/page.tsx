'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SignaturePad from '@/components/SignaturePad';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, getToken } from '@/lib/auth';

export default function SignatureSettingsPage() {
    const t = useTranslations('Settings');
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [existingSignature, setExistingSignature] = useState<string | null>(null);

    useEffect(() => {
        // Fetch existing signature status/url would go here
        // For now we just let them adopt a new one
    }, []);

    const handleSave = async (signatureDataUrl: string) => {
        setStatus('saving');
        const token = getToken();

        try {
            const res = await fetch(`${API_BASE_URL}/users/signature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ signature: signatureDataUrl })
            });

            if (!res.ok) throw new Error('Failed to save signature');

            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                router.refresh(); // or redirect
            }, 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Firma Digital</h1>
            <p className="text-gray-400 mb-8">
                Adopta tu firma digital para firmar Split Sheets automáticamente.
                Esta firma tiene validez legal dentro de la plataforma.
            </p>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                {status === 'success' ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">¡Firma Guardada!</h3>
                        <p className="text-gray-400">Tu firma ha sido adoptada correctamente.</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                            Actualizar Firma
                        </button>
                    </div>
                ) : (
                    <>
                        <SignaturePad
                            onSave={handleSave}
                            onCancel={() => router.back()}
                        />
                        {status === 'saving' && (
                            <p className="text-center text-primary mt-4 animate-pulse">Guardando firma protegida...</p>
                        )}
                        {status === 'error' && (
                            <p className="text-center text-red-500 mt-4">Error al guardar. Intenta de nuevo.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
