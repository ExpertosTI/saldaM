export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <aside className="w-64 border-r border-neutral-800 hidden md:block">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary">SALDAÑA</h2>
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
