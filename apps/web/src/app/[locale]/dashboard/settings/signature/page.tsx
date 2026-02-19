'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, getToken } from '@/lib/auth';
import SignatureCanvas, { SignatureCanvasRef } from '@/components/ui/SignatureCanvas';

export default function SignatureSettingsPage() {
    const router = useRouter();
    const sigPad = useRef<SignatureCanvasRef>(null);

    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [existingSignature, setExistingSignature] = useState<string | null>(null);

    // Fetch existing signature
    useEffect(() => {
        const fetchSignature = async () => {
            const token = getToken();
            try {
                const res = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.signatureUrl) setExistingSignature(data.signatureUrl);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchSignature();
    }, []);

    const handleSave = async () => {
        let signatureData = '';

        if (signMode === 'draw') {
            if (sigPad.current?.isEmpty()) return;
            signatureData = sigPad.current?.getTrimmedCanvas().toDataURL('image/png') || '';
        } else {
            if (!typedSignature.trim()) return;
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.font = '30px "Dancing Script", cursive';
                ctx.fillText(typedSignature, 20, 60);
                signatureData = canvas.toDataURL('image/png');
            }
        }

        setStatus('saving');
        const token = getToken();

        try {
            const res = await fetch(`${API_BASE_URL}/users/signature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ signature: signatureData })
            });

            if (!res.ok) throw new Error('Failed to save signature');

            setStatus('success');
            // Update local state to show the new one immediately
            setExistingSignature(signatureData);

            setTimeout(() => {
                setStatus('idle');
                router.refresh();
            }, 2000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold text-textMain mb-2">Firma Digital</h1>
            <p className="text-textMuted mb-8">
                Configura tu firma para agilizar tus acuerdos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Input */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col h-[500px]">
                    {/* Tabs */}
                    <div className="flex gap-4 mb-4 border-b border-border pb-2">
                        <button
                            onClick={() => setSignMode('draw')}
                            className={`pb-2 text-sm font-bold transition-colors flex-1 text-center ${signMode === 'draw' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-textMain'}`}
                        >
                            DIBUJAR
                        </button>
                        <button
                            onClick={() => setSignMode('type')}
                            className={`pb-2 text-sm font-bold transition-colors flex-1 text-center ${signMode === 'type' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-textMain'}`}
                        >
                            ESCRIBIR
                        </button>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 bg-white rounded-xl mb-4 overflow-hidden relative group border border-gray-200 shadow-inner">
                        {signMode === 'draw' && (
                            <div className="w-full h-full relative">
                                <SignatureCanvas
                                    ref={sigPad}
                                    canvasProps={{ className: 'w-full h-full touch-none' }}
                                    backgroundColor="white"
                                />
                                <div className="absolute bottom-2 left-4 text-xs text-gray-400 pointer-events-none select-none">
                                    Firma dentro del recuadro
                                </div>
                                <button
                                    onClick={() => sigPad.current?.clear()}
                                    className="absolute top-4 right-4 text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-100/80 hover:bg-gray-200 backdrop-blur px-3 py-1.5 rounded-full shadow-sm transition-colors border border-gray-300"
                                >
                                    Borrar
                                </button>
                            </div>
                        )}

                        {signMode === 'type' && (
                            <div className="w-full h-full flex items-center justify-center">
                                <input
                                    type="text"
                                    placeholder="Escribe tu nombre"
                                    className="w-full text-center text-4xl font-[cursive] text-black outline-none bg-transparent px-4"
                                    style={{ fontFamily: '"Dancing Script", cursive' }}
                                    value={typedSignature}
                                    onChange={(e) => setTypedSignature(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl border border-border text-textMuted hover:bg-surface-highlight transition-colors font-bold"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={status === 'saving'}
                            className="flex-1 py-3 bg-primary text-black font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {status === 'saving' ? 'Guardando...' : 'ADOPTAR FIRMA'}
                        </button>
                    </div>
                    {status === 'success' && <p className="text-green-500 text-center mt-2 font-bold animate-pulse">¡Firma guardada correctamente!</p>}
                    {status === 'error' && <p className="text-red-500 text-center mt-2">Error al guardar.</p>}
                </div>

                {/* Right Column: Preview */}
                <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-xl font-bold text-textMain mb-6">Tu Firma Actual</h3>

                    {existingSignature ? (
                        <div className="bg-white p-8 rounded-xl shadow-lg transform rotate-[-2deg] mb-6 max-w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={existingSignature}
                                alt="Firma Actual"
                                className="max-h-32 object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-32 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-textMuted mb-6">
                            No tienes firma configurada
                        </div>
                    )}

                    <p className="text-sm text-textMuted max-w-xs mx-auto">
                        Esta firma será utilizada automáticamente en todos los documentos que apruebes.
                    </p>
                </div>
            </div>
        </div>
    );
}
