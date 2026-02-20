'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getToken, API_BASE_URL } from '@/lib/auth';
import SignatureCanvas from '@/components/ui/SignatureCanvas';
import { Shield, Mail, FileCheck, Scale, PenTool, CheckCircle, ArrowRight, ArrowLeft, Upload, AlertTriangle, Loader2, Eye } from 'lucide-react';

// ======================== TYPES ========================
type SignStep = 'otp' | 'identity' | 'legal' | 'signature' | 'confirm';

interface SheetData {
    id: string;
    title: string;
    status: string;
    collaborators: Array<{
        email: string;
        legalName: string;
        role: string;
        percentage: number;
        hasSigned: boolean;
    }>;
}

interface SignatureCanvasRef {
    clear: () => void;
    isEmpty: () => boolean;
    toDataURL: (type?: string, quality?: number) => string;
    getTrimmedCanvas: () => HTMLCanvasElement;
}

// ======================== CONSTANTS ========================
const STEPS: { key: SignStep; label: string; icon: React.ReactNode }[] = [
    { key: 'otp', label: 'Verificación', icon: <Mail size={18} /> },
    { key: 'identity', label: 'Identidad', icon: <FileCheck size={18} /> },
    { key: 'legal', label: 'Acuerdo Legal', icon: <Scale size={18} /> },
    { key: 'signature', label: 'Firma', icon: <PenTool size={18} /> },
    { key: 'confirm', label: 'Confirmar', icon: <CheckCircle size={18} /> },
];

const LEGAL_AGREEMENT = `
ACUERDO DE LICENCIA Y DISTRIBUCIÓN DE DERECHOS DE AUTOR

Al firmar este documento, usted acepta los siguientes términos:

1. DECLARACIÓN DE AUTORÍA
Declaro bajo juramento que soy el autor/co-autor o titular legítimo de los derechos que se me atribuyen en este Split Sheet, y que tengo plena capacidad legal para otorgar los derechos aquí descritos.

2. DISTRIBUCIÓN DE PORCENTAJES
Acepto la distribución de porcentajes de derechos de autor tal como se establece en este documento. Esta distribución refleja fielmente el acuerdo alcanzado entre todos los colaboradores.

3. CESIÓN DE DERECHOS
Los porcentajes asignados representan la participación en los derechos de reproducción, distribución, comunicación pública y transformación de la obra musical descrita.

4. IRREVOCABILIDAD
Esta firma es irrevocable una vez que todos los colaboradores hayan firmado el documento. Cualquier modificación posterior requerirá un nuevo acuerdo firmado por todas las partes.

5. VERACIDAD DE LA INFORMACIÓN
Confirmo que toda la información personal proporcionada (nombre legal, IPI, afiliación PRO) es verídica y actualizada.

6. RESOLUCIÓN DE CONFLICTOS
En caso de disputa sobre los derechos de autor, las partes acuerdan resolver el conflicto mediante mediación antes de recurrir a procedimientos legales.

7. LEY APLICABLE
Este acuerdo se rige por las leyes de derechos de autor aplicables en la jurisdicción de las partes firmantes, incluyendo los tratados internacionales de propiedad intelectual.

8. FIRMA ELECTRÓNICA
Reconozco que mi firma electrónica tiene la misma validez legal que una firma manuscrita, de acuerdo con las leyes de firma electrónica aplicables.
`.trim();

// ======================== COMPONENT ========================
export default function SignSplitSheetPage() {
    const params = useParams();
    const router = useRouter();
    const canvasRef = useRef<SignatureCanvasRef>(null);

    // State
    const [currentStep, setCurrentStep] = useState<SignStep>('otp');
    const [sheet, setSheet] = useState<SheetData | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);

    // Identity State
    const [idDocPreview, setIdDocPreview] = useState<string | null>(null);
    const [idDocType, setIdDocType] = useState<'cedula' | 'passport'>('cedula');
    const [idUploaded, setIdUploaded] = useState(false);
    const [idLoading, setIdLoading] = useState(false);

    // Legal State
    const [legalScrolled, setLegalScrolled] = useState(false);
    const [legalAccepted, setLegalAccepted] = useState(false);

    // Signature State
    const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [signatureData, setSignatureData] = useState<string | null>(null);

    // ======================== FETCH DATA ========================
    const fetchData = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) {
                router.push(`/${params.locale}/login`);
                return;
            }

            // Fetch sheet details
            const res = await fetch(`${API_BASE_URL}/split-sheets/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load split sheet');
            const data = await res.json();
            setSheet(data);

            // Fetch PDF
            const pdfRes = await fetch(`${API_BASE_URL}/split-sheets/${params.id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (pdfRes.ok) {
                const blob = await pdfRes.blob();
                setPdfUrl(URL.createObjectURL(blob));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading data');
        } finally {
            setLoading(false);
        }
    }, [params.id, params.locale, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ======================== OTP HANDLERS ========================
    const handleRequestOtp = async () => {
        setOtpLoading(true);
        setOtpError(null);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/split-sheets/${params.id}/request-sign-otp`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to send OTP');
            }
            setOtpSent(true);
        } catch (err) {
            setOtpError(err instanceof Error ? err.message : 'Error sending code');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setOtpLoading(true);
        setOtpError(null);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/split-sheets/${params.id}/verify-sign-otp`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: otpCode })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Invalid code');
            }
            setOtpVerified(true);
        } catch (err) {
            setOtpError(err instanceof Error ? err.message : 'Verification failed');
        } finally {
            setOtpLoading(false);
        }
    };

    // ======================== IDENTITY HANDLERS ========================
    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError('File too large (max 10MB)');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setIdDocPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitId = async () => {
        if (!idDocPreview) return;
        setIdLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/split-sheets/${params.id}/upload-id`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ document: idDocPreview, documentType: idDocType })
            });
            if (!res.ok) throw new Error('Failed to upload document');
            setIdUploaded(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setIdLoading(false);
        }
    };

    // ======================== LEGAL SCROLL HANDLER ========================
    const handleLegalScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
        if (atBottom) setLegalScrolled(true);
    };

    // ======================== SIGNATURE HANDLERS ========================
    const captureSignature = (): string | null => {
        if (signMode === 'draw') {
            if (canvasRef.current?.isEmpty()) return null;
            return canvasRef.current?.toDataURL('image/png') || null;
        }
        if (signMode === 'type' && typedSignature.trim()) {
            // Create a canvas with typed text
            const canvas = document.createElement('canvas');
            canvas.width = 500;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 500, 150);
            ctx.fillStyle = '#000000';
            ctx.font = 'italic 42px "Dancing Script", "Brush Script MT", cursive';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(typedSignature, 250, 75);
            return canvas.toDataURL('image/png');
        }
        return null;
    };

    // ======================== FINAL SUBMIT ========================
    const handleFinalSign = async () => {
        if (!signatureData) return;
        setSubmitting(true);
        setError(null);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE_URL}/split-sheets/${params.id}/sign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ signature: signatureData })
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Error signing document');
            }
            router.push(`/${params.locale}/dashboard?signed=true`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signing failed');
            setSubmitting(false);
        }
    };

    // ======================== STEP NAVIGATION ========================
    const stepIndex = STEPS.findIndex(s => s.key === currentStep);

    const goNext = () => {
        if (currentStep === 'signature') {
            const sig = captureSignature();
            if (!sig) {
                setError('Please provide your signature before continuing.');
                return;
            }
            setSignatureData(sig);
            setError(null);
        }
        const nextIdx = stepIndex + 1;
        if (nextIdx < STEPS.length) {
            const nextStep = STEPS[nextIdx];
            if (nextStep) {
                setCurrentStep(nextStep.key);
                setError(null);
            }
        }
    };

    const goBack = () => {
        const prevIdx = stepIndex - 1;
        if (prevIdx >= 0) {
            const prevStep = STEPS[prevIdx];
            if (prevStep) {
                setCurrentStep(prevStep.key);
                setError(null);
            }
        }
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 'otp': return otpVerified;
            case 'identity': return idUploaded;
            case 'legal': return legalAccepted && legalScrolled;
            case 'signature': return true; // validated on goNext
            case 'confirm': return !!signatureData;
            default: return false;
        }
    };

    // ======================== RENDER ========================
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-[#0f0f0f]">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="text-[#D4AF37]" size={24} />
                        <div>
                            <h1 className="text-lg font-bold">Firma Segura</h1>
                            <p className="text-xs text-white/50">{sheet?.title || 'Split Sheet'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="text-sm text-white/40 hover:text-white/70 transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-8">
                    {STEPS.map((step, i) => (
                        <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                                    ${i < stepIndex ? 'bg-green-600 text-white' : ''}
                                    ${i === stepIndex ? 'bg-[#D4AF37] text-black ring-4 ring-[#D4AF37]/20' : ''}
                                    ${i > stepIndex ? 'bg-white/10 text-white/30' : ''}
                                `}>
                                    {i < stepIndex ? <CheckCircle size={18} /> : step.icon}
                                </div>
                                <span className={`text-[10px] mt-1.5 font-medium ${i <= stepIndex ? 'text-white/70' : 'text-white/20'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 mt-[-12px] rounded-full transition-all duration-300 ${i < stepIndex ? 'bg-green-600' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="max-w-4xl mx-auto px-4 pb-32">
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                {/* ---- STEP 1: OTP ---- */}
                {currentStep === 'otp' && (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                                <Mail className="text-[#D4AF37]" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Verificación por Email</h2>
                                <p className="text-sm text-white/50">Confirma tu identidad con un código de 6 dígitos</p>
                            </div>
                        </div>

                        {!otpSent ? (
                            <div className="text-center py-8">
                                <p className="text-white/60 mb-6">
                                    Enviaremos un código de verificación a tu correo electrónico registrado para confirmar tu identidad antes de firmar.
                                </p>
                                <button
                                    onClick={handleRequestOtp}
                                    disabled={otpLoading}
                                    className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c9a432] transition disabled:opacity-50 flex items-center gap-2 mx-auto"
                                >
                                    {otpLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                    Enviar Código de Verificación
                                </button>
                            </div>
                        ) : !otpVerified ? (
                            <div className="text-center py-6">
                                <p className="text-green-400 text-sm mb-6">✓ Código enviado a tu correo electrónico</p>
                                <div className="max-w-xs mx-auto mb-6">
                                    <label className="text-sm text-white/60 block mb-2">Ingresa el código de 6 dígitos:</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white focus:border-[#D4AF37] focus:outline-none transition"
                                        placeholder="000000"
                                        autoFocus
                                    />
                                </div>
                                {otpError && <p className="text-red-400 text-sm mb-4">{otpError}</p>}
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={otpCode.length !== 6 || otpLoading}
                                        className="px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c9a432] transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {otpLoading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                                        Verificar
                                    </button>
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={otpLoading}
                                        className="px-4 py-3 text-sm text-white/50 hover:text-white/80 transition"
                                    >
                                        Reenviar código
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
                                <p className="text-green-400 font-bold text-lg">Identidad Verificada</p>
                                <p className="text-white/50 text-sm mt-2">Tu correo electrónico ha sido confirmado exitosamente.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ---- STEP 2: IDENTITY ---- */}
                {currentStep === 'identity' && (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <FileCheck className="text-blue-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Documento de Identidad</h2>
                                <p className="text-sm text-white/50">Sube una foto de tu cédula o pasaporte</p>
                            </div>
                        </div>

                        {!idUploaded ? (
                            <>
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={() => setIdDocType('cedula')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${idDocType === 'cedula' ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]' : 'bg-white/5 border border-white/10 text-white/50'}`}
                                    >
                                        🪪 Cédula / ID
                                    </button>
                                    <button
                                        onClick={() => setIdDocType('passport')}
                                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${idDocType === 'passport' ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]' : 'bg-white/5 border border-white/10 text-white/50'}`}
                                    >
                                        📘 Pasaporte
                                    </button>
                                </div>

                                <label className="block cursor-pointer">
                                    <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${idDocPreview ? 'border-green-500/40' : 'border-white/20 hover:border-[#D4AF37]/40'}`}>
                                        {idDocPreview ? (
                                            <div className="relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={idDocPreview} alt="ID Preview" className="max-h-64 mx-auto rounded-lg" />
                                                <p className="text-green-400 text-sm mt-3">✓ Documento cargado</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="mx-auto mb-3 text-white/30" size={40} />
                                                <p className="text-white/50 text-sm">Arrastra o haz clic para subir</p>
                                                <p className="text-white/30 text-xs mt-1">JPG, PNG — Máximo 10MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleIdUpload} />
                                </label>

                                {idDocPreview && (
                                    <button
                                        onClick={handleSubmitId}
                                        disabled={idLoading}
                                        className="mt-4 w-full py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c9a432] transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {idLoading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                        Subir Documento
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
                                <p className="text-green-400 font-bold text-lg">Documento Verificado</p>
                                <p className="text-white/50 text-sm mt-2">Tu documento de identidad ha sido registrado.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ---- STEP 3: LEGAL ---- */}
                {currentStep === 'legal' && (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Scale className="text-purple-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Acuerdo Legal</h2>
                                <p className="text-sm text-white/50">Lee y acepta los términos antes de firmar</p>
                            </div>
                        </div>

                        {/* PDF Preview */}
                        {pdfUrl && (
                            <div className="mb-4">
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-[#D4AF37] hover:underline mb-3"
                                >
                                    <Eye size={16} /> Ver documento Split Sheet completo (PDF)
                                </a>
                            </div>
                        )}

                        {/* Legal Text */}
                        <div
                            className="bg-black/40 border border-white/10 rounded-xl p-4 h-64 overflow-y-auto text-sm text-white/70 leading-relaxed"
                            onScroll={handleLegalScroll}
                        >
                            <pre className="whitespace-pre-wrap font-sans">{LEGAL_AGREEMENT}</pre>
                        </div>

                        {!legalScrolled && (
                            <p className="text-xs text-[#D4AF37]/60 mt-2 flex items-center gap-1">
                                <ArrowRight size={12} className="rotate-90" /> Desplázate hacia abajo para leer el acuerdo completo
                            </p>
                        )}

                        <label className={`flex items-start gap-3 mt-4 p-4 rounded-xl border transition cursor-pointer ${legalAccepted ? 'bg-green-500/5 border-green-500/30' : 'bg-white/5 border-white/10'} ${!legalScrolled ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                                type="checkbox"
                                checked={legalAccepted}
                                onChange={(e) => setLegalAccepted(e.target.checked)}
                                disabled={!legalScrolled}
                                className="mt-0.5 w-5 h-5 accent-[#D4AF37]"
                            />
                            <span className="text-sm text-white/80">
                                He leído y acepto los términos del acuerdo legal. Entiendo que mi firma electrónica tiene validez legal y es irrevocable una vez completada por todos los colaboradores.
                            </span>
                        </label>
                    </div>
                )}

                {/* ---- STEP 4: SIGNATURE ---- */}
                {currentStep === 'signature' && (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                                <PenTool className="text-[#D4AF37]" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Tu Firma</h2>
                                <p className="text-sm text-white/50">Dibuja o escribe tu firma</p>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setSignMode('draw')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${signMode === 'draw' ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50'}`}
                            >
                                ✏️ Dibujar
                            </button>
                            <button
                                onClick={() => setSignMode('type')}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${signMode === 'type' ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50'}`}
                            >
                                ⌨️ Escribir
                            </button>
                        </div>

                        {signMode === 'draw' ? (
                            <div>
                                <div className="border border-white/20 rounded-xl overflow-hidden bg-white">
                                    <SignatureCanvas ref={canvasRef} />
                                </div>
                                <button
                                    onClick={() => canvasRef.current?.clear()}
                                    className="mt-2 text-sm text-white/40 hover:text-white/70 transition"
                                >
                                    Limpiar firma
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    value={typedSignature}
                                    onChange={(e) => setTypedSignature(e.target.value)}
                                    placeholder="Escribe tu nombre completo"
                                    className="w-full bg-white/5 border border-white/20 rounded-xl py-4 px-4 text-white text-lg focus:border-[#D4AF37] focus:outline-none transition"
                                />
                                {typedSignature && (
                                    <div className="mt-4 bg-white rounded-xl p-6 text-center">
                                        <span className="text-4xl text-black" style={{ fontFamily: '"Dancing Script", "Brush Script MT", cursive', fontStyle: 'italic' }}>
                                            {typedSignature}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ---- STEP 5: CONFIRM ---- */}
                {currentStep === 'confirm' && (
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="text-green-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Confirmar Firma</h2>
                                <p className="text-sm text-white/50">Revisa todo antes de firmar</p>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white/50 text-sm">Documento</span>
                                <span className="text-sm font-medium">{sheet?.title}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white/50 text-sm">Email Verificado</span>
                                <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle size={14} /> Sí</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white/50 text-sm">Documento de Identidad</span>
                                <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle size={14} /> Verificado</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/10">
                                <span className="text-white/50 text-sm">Acuerdo Legal</span>
                                <span className="text-green-400 text-sm flex items-center gap-1"><CheckCircle size={14} /> Aceptado</span>
                            </div>
                        </div>

                        {/* Signature Preview */}
                        {signatureData && (
                            <div className="bg-white rounded-xl p-4 mb-6">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={signatureData} alt="Tu firma" className="max-h-24 mx-auto" />
                            </div>
                        )}

                        <button
                            onClick={handleFinalSign}
                            disabled={submitting}
                            className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#c9a432] text-black font-extrabold text-lg rounded-xl hover:from-[#c9a432] hover:to-[#b89529] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
                        >
                            {submitting ? (
                                <><Loader2 size={20} className="animate-spin" /> Firmando...</>
                            ) : (
                                <><PenTool size={20} /> Firmar Documento</>
                            )}
                        </button>

                        <p className="text-xs text-white/30 text-center mt-3">
                            Al hacer clic, estás adoptando tu firma electrónica con validez legal.
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            {currentStep !== 'confirm' && (
                <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-white/10 p-4">
                    <div className="max-w-4xl mx-auto flex justify-between">
                        <button
                            onClick={goBack}
                            disabled={stepIndex === 0}
                            className="px-6 py-3 text-sm text-white/50 hover:text-white/80 transition disabled:opacity-20 flex items-center gap-2"
                        >
                            <ArrowLeft size={16} /> Atrás
                        </button>
                        <button
                            onClick={goNext}
                            disabled={!canProceed()}
                            className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#c9a432] transition disabled:opacity-30 flex items-center gap-2"
                        >
                            Continuar <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
