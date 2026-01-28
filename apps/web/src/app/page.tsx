import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-[url('https://images.unsplash.com/photo-1511379938547-c1f69419868d')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-background/90 z-0"></div>

            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <div className="fixed left-0 top-0 flex w-full justify-center border-b border-primary/20 bg-background/80 backdrop-blur-md pb-6 pt-8 dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                    <span className="text-2xl font-bold text-primary tracking-widest">SALDAÑA MUSIC</span>
                </div>
                <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
                    <Link href="/login" className="px-8 py-3 rounded-full bg-primary text-black font-bold hover:scale-105 transition-transform">
                        Client Portal
                    </Link>
                </div>
            </div>

            <div className="relative z-10 flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-primary/20 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-primary/10 after:via-primary/40 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
                        Secure Your <span className="text-primary">Legacy</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Professional Split Sheet Management & Legal Archiving for the Music Industry.
                    </p>
                </div>
            </div>

            <div className="z-10 mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8">
                <div className="group rounded-lg border border-primary/20 bg-surface px-5 py-6 transition-colors hover:border-primary/50 hover:bg-neutral-900/50">
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                        Collaborate{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50 text-gray-300">
                        Invite songwriters and producers to split sheets with a single click.
                    </p>
                </div>

                <div className="group rounded-lg border border-primary/20 bg-surface px-5 py-6 transition-colors hover:border-primary/50 hover:bg-neutral-900/50">
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                        Sign & Seal{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50 text-gray-300">
                        Legally binding digital signatures with SHA-256 audit trails.
                    </p>
                </div>

                <div className="group rounded-lg border border-primary/20 bg-surface px-5 py-6 transition-colors hover:border-primary/50 hover:bg-neutral-900/50">
                    <h2 className="mb-3 text-2xl font-semibold text-primary">
                        Archive{" "}
                        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                            -&gt;
                        </span>
                    </h2>
                    <p className="m-0 max-w-[30ch] text-sm opacity-50 text-gray-300">
                        Secure cloud storage for all your catalog's rights documentation.
                    </p>
                </div>
            </div>
        </main>
    );
}
