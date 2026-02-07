'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import SignatureCanvas from 'react-signature-canvas';
import { API_BASE_URL, getToken } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

export default function SignSplitSheetPage() {
    const params = useParams<{ locale: string; id: string }>();
    const router = useRouter();
    const t = useTranslations();
    const { toast } = useToast();
    const sigPad = useRef<SignatureCanvas>(null);

    const [loading, setLoading] = useState(true);
    const [splitSheet, setSplitSheet] = useState<any>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showSignModal, setShowSignModal] = useState(false);
    const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    useEffect(() => {
        fetchSheetDetails();
    }, []);

    const fetchSheetDetails = async () => {
        const token = getToken();
        if (!token) return router.push(`/${params.locale}/login?returnUrl=/split-sheet/${params.id}/sign`);

        try {
            // Get User Info for context
            const userRes = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (userRes.ok) {
                const user = await userRes.json();
                setCurrentUserEmail(user.email);
            }

            // Get Sheet Details
            const res = await fetch(`${API_BASE_URL}/split-sheets/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load');
            const data = await res.json();
            setSplitSheet(data);

            // Get PDF Blob
            const pdfRes = await fetch(`${API_BASE_URL}/split-sheets/${params.id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (pdfRes.ok) {
                const blob = await pdfRes.blob();
                setPdfUrl(window.URL.createObjectURL(blob));
            }

        } catch (e) {
            console.error(e);
            toast('Error loading document', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAdoptSignature = async () => {
        if (!acceptedTerms) return toast('Debes aceptar los términos y condiciones.', 'warning');

        let signatureData = '';
        if (signMode === 'draw') {
            if (sigPad.current?.isEmpty()) return toast('Por favor firma el documento.', 'warning');
            signatureData = sigPad.current?.getTrimmedCanvas().toDataURL('image/png') || '';
        } else {
            if (!typedSignature.trim()) return toast('Por favor escribe tu nombre.', 'warning');
            // Convert text to image (simulated for now, backend could handle text->image)
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

        setIsSubmitting(true);
        const token = getToken();

        try {
            // 1. Save Signature to User Profile (Adoption)
            await fetch(`${API_BASE_URL}/users/signature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ signature: signatureData })
            });

            // 2. Biometric Verification (FaceID/TouchID)
            // Ideally we use @simplewebauthn/browser here. 
            // For now, let's simulate the "Wow" factor with a UI delay and success message if package missing.
            // If user wants real WebAuthn, we need to set up the Relying Party on backend.
            // Let's mock a "Verifying Identity..." process that feels premium.

            const biometricPromise = new Promise(resolve => setTimeout(resolve, 1500));
            await biometricPromise;
            // TODO: Integrate actual WebAuthn startAuthentication() here in Phase 3.5

            // 3. Sign the Document
            const res = await fetch(`${API_BASE_URL}/split-sheets/${params.id}/sign`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                router.push(`/${params.locale}/dashboard?signed=true`);
            } else {
                throw new Error('Error signing document');
            }
        } catch (e) {
            console.error(e);
            toast('Falló el proceso de firma. Intenta nuevamente.', 'error');
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary">Cargando documento...</div>;

    const myCollaboratorStatus = splitSheet?.collaborators.find((c: any) => c.email === currentUserEmail);
    const alreadySigned = myCollaboratorStatus?.hasSigned;

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row">
            {/* Sidebar Details */}
            <div className="w-full md:w-80 border-r border-neutral-800 p-6 flex-shrink-0 bg-black/50 backdrop-blur-sm">
                <div className="mb-8">
                    <Link href={`/${params.locale}/dashboard`} className="text-gray-500 hover:text-white text-sm flex items-center gap-2 mb-6">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="text-xl font-bold text-white mb-2">{splitSheet?.title}</h1>
                    <p className="text-sm text-gray-400">Creado el {new Date(splitSheet?.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Estado de Firmas</h3>
                    <div className="space-y-3">
                        {splitSheet?.collaborators.map((c: any) => (
                            <div key={c.id} className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${c.hasSigned ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <div>
                                    <div className="text-sm font-medium text-gray-200">{c.legalName || c.email}</div>
                                    <div className="text-xs text-gray-500">{c.role} • {c.percentage}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {!alreadySigned ? (
                    <button
                        onClick={() => setShowSignModal(true)}
                        className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:brightness-110 transition-all shadow-lg hover:shadow-primary/20"
                    >
                        FIRMAR DOCUMENTO
                    </button>
                ) : (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center font-bold">
                        ✓ Ya has firmado este documento
                    </div>
                )}
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-neutral-900 p-4 md:p-8 flex items-center justify-center overflow-auto">
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full min-h-[600px] rounded-lg shadow-2xl border border-neutral-800"
                        title="Document Preview"
                    />
                ) : (
                    <div className="text-gray-500">No se pudo cargar la vista previa del PDF.</div>
                )}
            </div>

            {/* Signature Modal */}
            {showSignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Adoptar tu Firma</h2>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-neutral-800 pb-2">
                            <button
                                onClick={() => setSignMode('draw')}
                                className={`pb-2 text-sm font-bold transition-colors ${signMode === 'draw' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
                            >
                                DIBUJAR
                            </button>
                            <button
                                onClick={() => setSignMode('type')}
                                className={`pb-2 text-sm font-bold transition-colors ${signMode === 'type' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white'}`}
                            >
                                ESCRIBIR
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="bg-white rounded-xl mb-6 overflow-hidden h-40 flex items-center justify-center relative group">
                            {signMode === 'draw' ? (
                                <SignatureCanvas
                                    ref={sigPad}
                                    canvasProps={{ className: 'w-full h-full' }}
                                    backgroundColor="white"
                                />
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Escribe tu nombre completo"
                                    className="w-full h-full text-center text-3xl font-[cursive] text-black outline-none bg-transparent"
                                    style={{ fontFamily: '"Dancing Script", cursive' }} // Ensure font is loaded in global.css
                                    value={typedSignature}
                                    onChange={(e) => setTypedSignature(e.target.value)}
                                />
                            )}

                            {signMode === 'draw' && (
                                <button
                                    onClick={() => sigPad.current?.clear()}
                                    className="absolute top-2 right-2 text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded px-2 py-1"
                                >
                                    Borrar
                                </button>
                            )}
                        </div>

                        {/* Legal */}
                        <div className="mb-6">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-primary focus:ring-primary"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                />
                                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Acepto usar esta firma electrónica como mi representación legal vinculante para este acuerdo de Split Sheet. Entiendo que esta acción es final e irrevocable.
                                </span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSignModal(false)}
                                className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-lg hover:bg-neutral-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAdoptSignature}
                                disabled={isSubmitting || !acceptedTerms}
                                className="flex-1 py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Firmando...' : 'ADOPTAR Y FIRMAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
