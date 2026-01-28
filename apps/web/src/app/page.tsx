import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-background/90 z-0"></div>

            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <div className="fixed left-0 top-0 flex w-full justify-center border-b border-primary/20 bg-background/80 backdrop-blur-md pb-6 pt-8 dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    <span className="text-3xl font-extrabold text-primary tracking-widest drop-shadow-md">
                        SALDAÑA <span className="text-white">MUSIC</span>
                    </span>
                </div>
                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <Link href="/login" className="px-8 py-3 rounded-full bg-primary text-black font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                        Portal de Clientes
                    </Link>
                </div>
            </div>

            <div className="relative z-10 flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-primary/20 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-primary/10 after:via-primary/40 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-primary/20 before:dark:opacity-10 after:dark:from-amber-900 after:dark:via-[#D4AF37] after:dark:opacity-40 before:lg:h-[360px]">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
                        Asegura Tu <span className="text-primary italic">Legado</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Gestión Profesional de Split Sheets y Archivo Legal para la Industria Musical.
                    </p>
                </div>
            </div>

            <div className="z-10 mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8">
                <div className="group rounded-lg border border-primary/20 bg-surface px-5 py-6 transition-all hover:border-primary/50 hover:bg-neutral-900/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                        Colabora{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50 text-gray-300">
                        Invita a compositores y productores a tus split sheets con un solo clic.
                    </p>
                </div>

                <div className="group rounded-lg border border-primary/20 bg-surface px-5 py-6 transition-all hover:border-primary/50 hover:bg-neutral-900/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                        Firma y Sella{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50 text-gray-300">
                        Firmas digitales legalmente vinculantes con auditoría SHA-256.
                    </p>
                </div>

                <div className="group rounded-lg border border-primary/20 bg-surface px-5 py-6 transition-all hover:border-primary/50 hover:bg-neutral-900/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                        Archiva{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50 text-gray-300">
                        Almacenamiento seguro en la nube para toda la documentación de tus derechos.
                    </p>
                </div>
            </div>
        </main>
    );
}
