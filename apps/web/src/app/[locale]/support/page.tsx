import Link from "next/link";

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-gray-300 selection:bg-primary/30 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/" className="text-sm text-primary hover:underline mb-8 block">&larr; Volver al Inicio</Link>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Centro de Soporte</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <span className="text-4xl mb-4 block">📧</span>
                        <h2 className="text-2xl font-semibold text-white mb-2">Contacto General</h2>
                        <p className="mb-4 text-gray-400">Para consultas sobre la plataforma o reportes de errores.</p>
                        <a href="mailto:soporte@saldanamusic.com" className="text-primary font-bold hover:underline">soporte@saldanamusic.com</a>
                    </div>

                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                        <span className="text-4xl mb-4 block">⚖️</span>
                        <h2 className="text-2xl font-semibold text-white mb-2">Dudas Legales</h2>
                        <p className="mb-4 text-gray-400">Consultas sobre contratos, firmas y validez jurídica.</p>
                        <a href="mailto:legal@saldanamusic.com" className="text-primary font-bold hover:underline">legal@saldanamusic.com</a>
                    </div>
                </div>

                <div className="mt-12 space-y-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">Preguntas Frecuentes</h2>

                    <details className="bg-white/5 rounded-xl overflow-hidden group">
                        <summary className="p-6 cursor-pointer font-medium text-white group-hover:bg-white/10 transition-colors flex justify-between items-center">
                            ¿Cómo verifico mi identidad?
                            <span className="text-primary">+</span>
                        </summary>
                        <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                            Utilizamos verificación biométrica avanzada y validación de correo electrónico. Asegúrate de completar tu perfil en la sección de Configuración.
                        </div>
                    </details>

                    <details className="bg-white/5 rounded-xl overflow-hidden group">
                        <summary className="p-6 cursor-pointer font-medium text-white group-hover:bg-white/10 transition-colors flex justify-between items-center">
                            ¿Mis contratos son válidos internacionalmente?
                            <span className="text-primary">+</span>
                        </summary>
                        <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                            Sí. Nuestros Split Sheets utilizan estándares de firma electrónica reconocidos en la mayoría de jurisdicciones (eIDAS, ESIGN Act).
                        </div>
                    </details>

                    <details className="bg-white/5 rounded-xl overflow-hidden group">
                        <summary className="p-6 cursor-pointer font-medium text-white group-hover:bg-white/10 transition-colors flex justify-between items-center">
                            ¿Cómo cobro mis regalías?
                            <span className="text-primary">+</span>
                        </summary>
                        <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                            Conecta tu cuenta bancaria o wallet en la sección de Regalías. Los pagos se procesan trimestralmente.
                        </div>
                    </details>
                </div>
            </div>
        </main>
    );
}
