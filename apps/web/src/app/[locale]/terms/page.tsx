import Link from "next/link";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-gray-300 selection:bg-primary/30 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/" className="text-sm text-primary hover:underline mb-8 block">&larr; Volver al Inicio</Link>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Términos y Condiciones</h1>

                <div className="space-y-6 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Aceptación de Términos</h2>
                        <p>
                            Al acceder y utilizar la plataforma Saldaña Music, usted acepta estar legalmente vinculado por estos términos. Si no está de acuerdo, no utilice nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. Servicios de Gestión</h2>
                        <p>
                            Saldaña Music provee herramientas tecnológicas para la gestión de derechos. No somos una firma de abogados y nuestros contratos generados son herramientas estándar que deben ser revisadas por sus asesores legales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Propiedad Intelectual</h2>
                        <p>
                            Usted retiene el 100% de la propiedad de sus obras musicales. Saldaña Music no reclama derechos sobre su música, solo provee la infraestructura para gestionarla.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Firmas Digitales</h2>
                        <p>
                            Las firmas electrónicas realizadas en la plataforma son vinculantes. Usted es responsable de asegurar el acceso a su cuenta para evitar firmas no autorizadas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">5. Limitación de Responsabilidad</h2>
                        <p>
                            Saldaña Music no se hace responsable por disputas de regalías entre colaboradores derivadas de información incorrecta ingresada por los usuarios en los Split Sheets.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
