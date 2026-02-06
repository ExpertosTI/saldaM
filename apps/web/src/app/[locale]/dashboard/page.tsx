import { getTranslations, getLocale } from 'next-intl/server';
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

    let recentSheets: any[] = [];
    let stats = { totalSongs: 0, pendingSignatures: 0, estimatedRoyalties: 0 };

    if (token) {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api';

            const resStats = await fetch(`${apiUrl}/split-sheets/stats`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            if (resStats.ok) stats = await resStats.json();

            const resList = await fetch(`${apiUrl}/split-sheets`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            if (resList.ok) recentSheets = await resList.json();
        } catch (e) {
            console.error("Failed to fetch dashboard data", e);
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'PENDING_SIGNATURES':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Completado';
            case 'PENDING_SIGNATURES': return 'Pendiente';
            default: return 'Borrador';
        }
    };

    return (
        <div>
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-12">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{t('myCatalog')}</h1>
                    <p className="text-gray-400 text-sm sm:text-base">{t('manageRights')}</p>
                </div>
                <Link
                    href={`/${locale}/dashboard/create`}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] text-center text-sm sm:text-base"
                >
                    {t('newSplitSheet')}
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div className="glass-panel p-4 sm:p-6 rounded-xl">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">{t('totalCatalog')}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">
                        {stats.totalSongs} <span className="text-sm sm:text-base font-normal text-gray-500">{t('songs')}</span>
                    </h3>
                </div>
                <div className="glass-panel p-4 sm:p-6 rounded-xl border-l-4 border-primary">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">{t('pendingSignatures')}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-primary">
                        {stats.pendingSignatures} <span className="text-sm sm:text-base font-normal text-gray-500">{t('actionRequired')}</span>
                    </h3>
                </div>
                <div className="glass-panel p-4 sm:p-6 rounded-xl">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">{t('estRoyalties')}</p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">
                        ${stats.estimatedRoyalties.toFixed(2)} <span className="text-sm sm:text-base font-normal text-gray-500">USD</span>
                    </h3>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 border-b border-gray-800 pb-2">{t('quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {/* Create Sheet Card */}
                <Link href={`/${locale}/dashboard/create`} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-primary/50 transition-all p-5 sm:p-6">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 sm:mb-4 text-primary group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2">{t('newSplitSheetTitle')}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 flex-grow">{t('newSplitSheetDesc')}</p>
                        <span className="text-primary text-xs sm:text-sm font-semibold flex items-center gap-2">
                            {t('startCreation')} <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                    </div>
                </Link>

                <Link href={`/${locale}/dashboard/collaborators`} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-blue-500/50 transition-all p-5 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3 sm:mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2">{t('myCollaborators')}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">{t('manageRoster')}</p>
                    <span className="text-blue-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                        Ver Colaboradores <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                </Link>

                <Link href={`/${locale}/dashboard/royalties`} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 hover:border-purple-500/50 transition-all p-5 sm:p-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 sm:mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2">{t('royaltyAnalytics')}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">{t('trackEarnings')}</p>
                    <span className="text-purple-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
                        Ver Estadísticas <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                </Link>
            </div>

            {/* Recent Activity List */}
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 border-b border-gray-800 pb-2">{t('recentAgreements')}</h2>
            <div className="space-y-3 sm:space-y-4">
                {recentSheets.length === 0 ? (
                    <div className="text-gray-500 text-center py-8 text-sm sm:text-base">{t('noSheetsFound')}</div>
                ) : (
                    recentSheets.slice(0, 5).map((sheet: any) => (
                        <div key={sheet.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-neutral-800/50 transition-colors">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-neutral-800 flex items-center justify-center text-lg">🎵</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{sheet.title}</h4>
                                    <p className="text-xs text-gray-500">{t('created')}: {new Date(sheet.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 ml-12 sm:ml-0">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(sheet.status)}`}>
                                    {getStatusLabel(sheet.status)}
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

            {recentSheets.length > 5 && (
                <div className="text-center mt-6">
                    <Link href={`/${locale}/dashboard/split-sheets`} className="text-primary hover:underline text-sm">
                        Ver todos los Split Sheets →
                    </Link>
                </div>
            )}
        </div>
    );
}
