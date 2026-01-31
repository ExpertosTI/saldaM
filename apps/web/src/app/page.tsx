import Link from "next/link";

export default async function Home({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    return (
        <main className="flex min-h-screen flex-col items-center relative overflow-hidden bg-[#050505] text-white selection:bg-primary/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <img src="/logo.png" alt="Saldaña Music Logo" className="relative h-10 w-auto object-contain" />
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-lg font-bold tracking-[0.2em] text-white leading-none">SALDAÑA</span>
                            <span className="text-[0.55rem] tracking-[0.6em] text-primary/80 uppercase font-light text-center leading-none mt-1">MUSIC</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6">
                        <Link href={`/${locale}/login`} className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link href={`/${locale}/register`} className="group relative px-6 py-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden transition-all duration-300 hover:border-primary/50 hover:bg-white/10">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <span className="relative text-sm font-medium text-white group-hover:text-primary transition-colors">
                                Unirse al Roster
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium tracking-wide text-gray-300">SISTEMA OPERATIVO LEGAL PARA MÚSICA</span>
                </div>

                <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1] animate-fade-in-up delay-100">
                    <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
                        Tu Legado Musical,
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary/50 font-serif italic pr-2">
                        Blindado.
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed animate-fade-in-up delay-200">
                    La plataforma definitiva para gestionar Split Sheets, catálogos y regalías con validez legal internacional. Diseñada para la élite de la industria.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-fade-in-up delay-300">
                    <Link href={`/${locale}/register`} className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                        <span className="relative z-10">Comenzar Ahora</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-white to-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                    </Link>
                </div>

                {/* Dashboard Preview / Trusted By */}
                <div className="mt-20 w-full animate-fade-in-up delay-500">
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl shadow-primary/5 transform rotate-x-12 perspective-1000 group hover:shadow-primary/10 transition-shadow duration-500">
                        {/* Mock UI Frame */}
                        <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            <div className="ml-4 h-4 w-60 rounded-full bg-white/5" />
                        </div>
                        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-gray-900 to-black p-8 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm text-primary mb-2 font-mono">ESTADO DEL SISTEMA</p>
                                <h3 className="text-3xl font-bold text-white mb-1">Activo y Seguro</h3>
                                <p className="text-gray-500 text-sm">Dashboard v2.0 Cargando...</p>
                            </div>
                            {/* Overlay Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features (Bento Grid) */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Todo lo que necesitas</h2>
                    <p className="text-gray-400">Herramientas profesionales para una industria exigente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Feature 1 */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-500">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Split Sheets Digitales</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Genera acuerdos de porcentajes en segundos. Firma digitalmente desde cualquier dispositivo con validez legal.
                        </p>
                    </div>

                    {/* Feature 2 (Large) */}
                    <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-500">
                        <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                            <div className="flex-1">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.57-4.181m13.239 8.242a22 22 0 01-4.515 4.707m-5.323-2.365a21.807 21.807 0 01-3.235-3.297" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Firma Biométrica & Auditoría</h3>
                                <p className="text-gray-400 leading-relaxed text-sm mb-6">
                                    Cada acuerdo genera un hash único SHA-256 grabado en un registro inmutable. Capturamos IP, dispositivo y huella de tiempo para máxima seguridad jurídica en disputas de regalías.
                                </p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300">SHA-256</span>
                                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300">Geo-IP</span>
                                    <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300">Compliance</span>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 relative h-40 md:h-full bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                                {/* Visual abstraction of signature */}
                                <div className="absolute inset-0 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SaldanaMusicVerify')] opacity-10 bg-center bg-no-repeat blur-[2px]" />
                                <div className="relative z-10 p-4 border border-primary/20 bg-black/80 rounded-lg shadow-2xl">
                                    <div className="w-32 h-8 bg-white/10 rounded mb-2 animate-pulse" />
                                    <div className="w-20 h-2 bg-primary/20 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.05] hover:border-primary/30 transition-all duration-500">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Catálogo Centralizado</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Tu inventario maestro de obras. Metadatos ISRC, ISWC y créditos de producción organizados y listos para exportar.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full border-t border-white/5 bg-black py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <img src="/logo.png" alt="Logo" className="h-6 w-auto grayscale" />
                        <span className="text-xs tracking-widest uppercase">Saldaña Music © 2026</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <Link href={`/${locale}/privacy`} className="hover:text-primary transition-colors">Privacidad</Link>
                        <Link href={`/${locale}/terms`} className="hover:text-primary transition-colors">Términos</Link>
                        <Link href={`/${locale}/support`} className="hover:text-primary transition-colors">Soporte</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
