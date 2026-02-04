'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { getToken, API_BASE_URL } from '@/lib/auth';

interface SplitSheet {
    id: string;
    title: string;
    status: 'DRAFT' | 'PENDING_SIGNATURES' | 'COMPLETED';
    createdAt: string;
    collaborators?: any[];
}

export default function SplitSheetsPage() {
    const locale = useLocale();
    const t = useTranslations('SplitSheet');

    const [sheets, setSheets] = useState<SplitSheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Stats
    const [stats, setStats] = useState({ draft: 0, pending: 0, completed: 0, total: 0 });

    const fetchSheets = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/split-sheets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data: SplitSheet[] = await res.json();
                setSheets(data);

                // Calculate stats
                setStats({
                    draft: data.filter(s => s.status === 'DRAFT').length,
                    pending: data.filter(s => s.status === 'PENDING_SIGNATURES').length,
                    completed: data.filter(s => s.status === 'COMPLETED').length,
                    total: data.length
                });
            }
        } catch (e) {
            console.error('Error fetching sheets:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSheets();
    }, []);

    const filteredSheets = sheets.filter(sheet => {
        const matchesSearch = !search || sheet.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || sheet.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'PENDING_SIGNATURES':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            default:
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return t('statusCompleted');
            case 'PENDING_SIGNATURES': return t('statusPending');
            default: return t('statusDraft');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este Split Sheet?')) return;

        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/split-sheets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setSheets(sheets.filter(s => s.id !== id));
            }
        } catch (e) {
            console.error('Error deleting sheet:', e);
        }
    };

    const handleDownloadPdf = async (id: string, title: string) => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/split-sheets/${id}/full-pdf`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_split_sheet.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (e) {
            console.error('Error downloading PDF:', e);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('listTitle')}</h1>
                    <p className="text-gray-400 text-sm">{t('listSubtitle')}</p>
                </div>
                <Link
                    href={`/${locale}/dashboard/create`}
                    className="px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all text-center text-sm"
                >
                    {t('createNew')}
                </Link>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="glass-panel p-4 rounded-xl">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-gray-400">{t('totalSheets')}</p>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <p className="text-2xl font-bold text-yellow-400">{stats.draft}</p>
                    <p className="text-xs text-gray-400">{t('drafts')}</p>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <p className="text-2xl font-bold text-blue-400">{stats.pending}</p>
                    <p className="text-xs text-gray-400">{t('pendingCount')}</p>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                    <p className="text-xs text-gray-400">{t('completedCount')}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:border-primary outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${!statusFilter
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-neutral-900/50 border-neutral-700 text-gray-400 hover:text-white'
                            }`}
                    >
                        {t('filterAll')}
                    </button>
                    <button
                        onClick={() => setStatusFilter('DRAFT')}
                        className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${statusFilter === 'DRAFT'
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                : 'bg-neutral-900/50 border-neutral-700 text-gray-400 hover:text-white'
                            }`}
                    >
                        {t('filterDraft')}
                    </button>
                    <button
                        onClick={() => setStatusFilter('PENDING_SIGNATURES')}
                        className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${statusFilter === 'PENDING_SIGNATURES'
                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                : 'bg-neutral-900/50 border-neutral-700 text-gray-400 hover:text-white'
                            }`}
                    >
                        {t('filterPending')}
                    </button>
                    <button
                        onClick={() => setStatusFilter('COMPLETED')}
                        className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${statusFilter === 'COMPLETED'
                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                : 'bg-neutral-900/50 border-neutral-700 text-gray-400 hover:text-white'
                            }`}
                    >
                        {t('filterCompleted')}
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-panel p-4 rounded-xl animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-neutral-800" />
                                <div className="flex-1">
                                    <div className="h-4 w-48 bg-neutral-800 rounded mb-2" />
                                    <div className="h-3 w-24 bg-neutral-800 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredSheets.length === 0 ? (
                <div className="glass-panel p-12 rounded-xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                        <span className="text-3xl">📄</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{t('noSheets')}</h3>
                    <p className="text-gray-500 text-sm mb-4">{t('createFirst')}</p>
                    <Link href={`/${locale}/dashboard/create`} className="text-primary hover:underline text-sm">
                        {t('createLink')} →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredSheets.map(sheet => (
                        <div key={sheet.id} className="glass-panel p-4 rounded-xl hover:border-primary/30 transition-colors group">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-lg">
                                        🎵
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{sheet.title}</h4>
                                        <p className="text-xs text-gray-500">
                                            {new Date(sheet.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-14 sm:ml-0">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(sheet.status)}`}>
                                        {getStatusLabel(sheet.status)}
                                    </span>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDownloadPdf(sheet.id, sheet.title)}
                                            className="p-2 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
                                            title="Descargar PDF"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sheet.id)}
                                            className="p-2 hover:bg-red-500/10 rounded transition-colors text-gray-400 hover:text-red-400"
                                            title="Eliminar"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
