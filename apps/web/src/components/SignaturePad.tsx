'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const SignatureCanvasComponent = dynamic(() => import('react-signature-canvas'), { ssr: false });

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void;
    onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
    const sigCanvas = useRef<any>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const t = useTranslations('Signature'); // Assuming you'll add translations

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
    };

    const save = () => {
        if (sigCanvas.current) {
            const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    const handleEnd = () => {
        setIsEmpty(sigCanvas.current?.isEmpty() ?? true);
    };

    return (
        <div className="flex flex-col gap-4 w-full h-full max-w-lg mx-auto bg-neutral-900 rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold text-lg">Firmar Documento</h3>
                <button onClick={clear} className="text-xs text-gray-400 hover:text-white underline">
                    Limpiar
                </button>
            </div>

            <div className="border border-white/20 rounded-lg overflow-hidden bg-white/5 relative">
                <SignatureCanvasComponent
                    ref={sigCanvas}
                    penColor="white"
                    canvasProps={{
                        className: 'w-full h-64 cursor-crosshair active:cursor-crosshair',
                    }}
                    onEnd={handleEnd}
                />
                <div className="absolute bottom-2 left-2 text-[10px] text-gray-500 pointer-events-none select-none">
                    Dibuja tu firma aquí
                </div>
            </div>

            <div className="flex gap-3 mt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={save}
                    disabled={isEmpty}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-black font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Adoptar y Firmar
                </button>
            </div>
        </div>
    );
}
