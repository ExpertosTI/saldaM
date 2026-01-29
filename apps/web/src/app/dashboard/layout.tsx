export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <aside className="w-64 border-r border-neutral-800 hidden md:block">
                <div className="p-6 flex flex-col items-center border-b border-neutral-800/50 mb-6">
                    <img src="/logo.svg" alt="Saldaña Music" className="h-14 w-auto drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
                    <div className="mt-2 text-[0.6rem] tracking-[0.4em] text-primary uppercase font-bold">
                        Member Portal
                    </div>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {['Dashboard', 'My Split Sheets', 'Collaborators', 'Royalties', 'Settings'].map((item) => (
                        <a key={item} href="#" className="block px-4 py-3 text-gray-400 hover:bg-surface hover:text-primary rounded-lg transition-colors">
                            {item}
                        </a>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
