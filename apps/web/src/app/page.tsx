import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden bg-[#0a0a0a] text-white">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />

            {/* Navbar */}
            <nav className="z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-12 w-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-xl font-bold tracking-[0.2em] text-white">
                            SALDAÑA
                        </span>
                        <span className="text-[0.6rem] tracking-[0.6em] text-primary uppercase font-light text-center -mt-1">
                            MUSIC
                        </span>
                    </div>
                </div>
                <Link href="/login" className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 text-sm font-medium backdrop-blur-md">
                    Portal de Clientes
                </Link>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-col items-center text-center mt-20 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Sistema Operativo para Derechos Musicales
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 max-w-4xl">
                    Gestiona tu legado musical <br /> sin fricción legal.
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                    La plataforma definitiva para Split Sheets, gestión de catálogo y auditoría de regalías. Diseñada para managers, sellos y compositores de élite.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link href="/login" className="px-8 py-4 rounded-full bg-primary text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                        Comenzar Ahora
                    </Link>
                    <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors backdrop-blur-md">
                        Ver Demo
                    </button>
                </div>
            </div>

            {/* Feature Grid (Bento Style) */}
            <div className="z-10 mt-32 mb-20 w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 hover:border-primary/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-semibold mb-3 relative z-10">Colaboración Real</h3>
                    <p className="text-gray-400 leading-relaxed relative z-10">
                        Invita colaboradores y asigna porcentajes en tiempo real. Sin emails perdidos, sin PDFs corruptos.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 hover:border-primary/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-semibold mb-3 relative z-10">Firma Biométrica</h3>
                    <p className="text-gray-400 leading-relaxed relative z-10">
                        Validez legal internacional con auditoría SHA-256. Tus acuerdos son inmutables.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 hover:border-primary/30 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-semibold mb-3 relative z-10">Catálogo Zen</h3>
                    <p className="text-gray-400 leading-relaxed relative z-10">
                        Organiza álbumes, ISRC y metadatos en un solo lugar. Tu patrimonio, ordenado.
                    </p>
                </div>
            </div>
        </main>
    );
}
