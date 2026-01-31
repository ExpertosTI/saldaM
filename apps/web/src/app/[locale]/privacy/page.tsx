import Link from "next/link";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-gray-300 selection:bg-primary/30 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/" className="text-sm text-primary hover:underline mb-8 block">&larr; Volver al Inicio</Link>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Política de Privacidad</h1>

                <div className="space-y-6 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Recopilación de Información</h2>
                        <p>
                            En Saldaña Music, recopilamos información necesaria para la gestión de derechos musicales y auditoría, incluyendo pero no limitado a: datos biométricos para firma digital (dirección IP, huella de dispositivo), información de contacto y metadatos de obras musicales (ISRC, ISWC).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Uso de la Información</h2>
                        <p>
                            Utilizamos sus datos exclusivamente para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li>Generar contratos legales (Split Sheets).</li>
                            <li>Proveer traza de auditoría inmutable.</li>
                            <li>Gestionar su catálogo musical y regalías.</li>
                            <li>Mejorar la seguridad y funcionalidad de la plataforma.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Seguridad de Datos</h2>
                        <p>
                            Implementamos estándares de encriptación de grado bancario y almacenamiento seguro. Sus datos de firma digital son inmutables y están protegidos contra alteraciones.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Compartir Información</h2>
                        <p>
                            No vendemos sus datos personales. Solo compartimos información estrictamente necesaria con socios legales o cuando sea requerido por ley para la validación de derechos de autor.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Contacto</h2>
                        <p>
                            Para dudas sobre privacidad, contacte a <a href="mailto:legal@saldanamusic.com" className="text-primary hover:underline">legal@saldanamusic.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
