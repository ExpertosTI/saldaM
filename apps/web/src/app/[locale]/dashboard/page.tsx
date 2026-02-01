import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import ActionsRow from '@/components/dashboard/ActionsRow';

export default async function DashboardHome({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('Dashboard.header');

    // Fetch real stats from API
    // Note: In Next.js Server Components, we need to pass the cookie manually if using Fetch
    // We can assume the cookie 'token' is available
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    let currentUserId = null;
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length < 2) throw new Error('Invalid token');
            const payload = JSON.parse(atob(parts[1]!));
            currentUserId = payload.sub || payload.id;
        } catch (e) { }
    }

    let recentSheets = [];
    let stats = { totalSongs: 0, pendingSignatures: 0, estimatedRoyalties: 0 };

    if (token) {
        try {
            const resStats = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/split-sheets/stats`, {
                headers: { 'Authorization': `Bearer ${token}` },
                next: { revalidate: 0 }
            });
            if (resStats.ok) stats = await resStats.json();

            const resList = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/split-sheets`, {
                headers: { 'Authorization': `Bearer ${token}` },
                next: { revalidate: 0 }
            });
            if (resList.ok) recentSheets = await resList.json();
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        }
    }

    return (
        <div>
            {/* ... Header & Stats (omitted for brevity in replace, but kept in structure) ... */}
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{t('myCatalog')}</h1>
                    <p className="text-gray-400">{t('manageRights')}</p>
                </div>
                <Link href={`/${locale}/dashboard/create`} className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    + New Split Sheet
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Total Catalog</p>
                    <h3 className="text-3xl font-bold text-white">{stats.totalSongs} <span className="text-base font-normal text-gray-500">Songs</span></h3>
                </div>
                <div className="glass-panel p-6 rounded-xl border-l-4 border-primary">
                    <p className="text-gray-400 text-sm mb-1">Pending Signatures</p>
                    <h3 className="text-3xl font-bold text-primary">{stats.pendingSignatures} <span className="text-base font-normal text-gray-500">Action Required</span></h3>
                </div>
                <div className="glass-panel p-6 rounded-xl">
                    <p className="text-gray-400 text-sm mb-1">Est. Royalties (Q1)</p>
                    <h3 className="text-3xl font-bold text-white">${stats.estimatedRoyalties.toFixed(2)} <span className="text-base font-normal text-gray-500">USD</span></h3>
                </div>
            </div>

            {/* Quick Actions Grid (Collapsed in thought, but keeping in file) */}
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {/* ... (Keep existing cards) ... */}
                {/* Create Sheet Card */}
                <Link href={`/${locale}/dashboard/create`} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-primary/50 transition-all p-6">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H6a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">New Split Sheet</h3>
                        <p className="text-gray-400 text-sm mb-4 flex-grow">Create a new copyright agreement for your song or album.</p>
                        <span className="text-primary text-sm font-semibold flex items-center gap-2">
                            Start Creation <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </div>
                </Link>

                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-blue-500/50 transition-all p-6 opacity-80 hover:opacity-100 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">My Collaborators</h3>
                    <p className="text-gray-400 text-sm mb-4">Manage your roster. (Coming Soon)</p>
                </div>

                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-purple-500/50 transition-all p-6 opacity-80 hover:opacity-100 cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Royalty Analytics</h3>
                    <p className="text-gray-400 text-sm mb-4">Track earnings. (Coming Soon)</p>
                </div>
            </div>

            {/* Recent Activity List */}
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Recent Agreements</h2>
            <div className="space-y-4">
                {recentSheets.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No split sheets found. Create one to get started!</div>
                ) : (
                    recentSheets.map((sheet: any) => (
                        <div key={sheet.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center">🎵</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{sheet.title}</h4>
                                    <p className="text-xs text-gray-500">Created: {new Date(sheet.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sheet.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                    sheet.status === 'PENDING_SIGNATURES' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {sheet.status || 'DRAFT'}
                                </span>
                                <ActionsRow
                                    sheet={sheet}
                                    currentUserId={currentUserId}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
