import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-gray-300 selection:bg-primary/30 pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link href="/" className="text-sm text-primary hover:underline mb-8 block">&larr; Volver al Inicio</Link>

                <div className="relative">
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">Quiénes Somos</h1>
                    <p className="text-xl text-primary font-light tracking-wide mb-12">Innovación para el Legado Musical</p>
                </div>


                <div className="space-y-12 text-lg leading-relaxed">
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-semibold text-white mb-4">Nuestra Misión</h2>
                            <p>
                                Democratizar el acceso a herramientas de gestión de derechos de nivel discográfico. Creemos que cada creador, desde el productor emergente hasta el artista consagrado, merece protección legal robusta y transparente para su obra.
                            </p>
                        </div>
                        <div className="h-64 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <span className="text-4xl">🚀</span>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">Tecnología y Arte</h2>
                        <p className="mb-4">
                            Saldaña Music fusiona la pasión artística con la precisión tecnológica. Nuestra plataforma utiliza:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <li className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
                                <span className="block text-primary font-bold mb-1">Blockchain Tech</span>
                                <span className="text-sm">Inmutabilidad en registros</span>
                            </li>
                            <li className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
                                <span className="block text-primary font-bold mb-1">Cloud Native</span>
                                <span className="text-sm">Acceso global instantáneo</span>
                            </li>
                            <li className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
                                <span className="block text-primary font-bold mb-1">UX Premium</span>
                                <span className="text-sm">Diseño intuitivo y veloz</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center">
                        <h2 className="text-2xl font-semibold text-white mb-2">Únete a la Revolución</h2>
                        <p className="mb-6 max-w-2xl mx-auto">
                            Gestiona tu carrera con la seriedad que merece tu talento.
                        </p>
                        <Link href="/register" className="inline-block px-8 py-3 rounded-full bg-primary text-black font-bold hover:scale-105 transition-transform">
                            Comencemos
                        </Link>
                    </section>
                </div>
            </div>
        </main>
    );
}
