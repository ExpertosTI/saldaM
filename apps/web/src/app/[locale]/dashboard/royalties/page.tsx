'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function RoyaltiesPage() {
    const locale = useLocale();
    const [period, setPeriod] = useState('30d');

    // Placeholder data - would come from API
    const stats = {
        totalEarnings: 0,
        topTrack: null,
        pendingPayout: 0,
        streamsTotal: 0
    };

    const mockChartData = [40, 60, 30, 80, 50, 90, 70, 40, 60, 30, 80, 50];

    return (
        <div className="max-w-6xl mx-auto page-transition">
            <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Regalías y Analíticas</h1>
                    <p className="text-gray-400 text-sm">Rastrea tus ganancias y el rendimiento de tu catálogo.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                    >
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="90d">Últimos 90 días</option>
                        <option value="year">Este año</option>
                        <option value="all">Todo el tiempo</option>
                    </select>
                </div>
            </header>

            {/* Coming Soon Banner */}
            <div className="glass-panel p-6 rounded-xl mb-6 border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-full">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Próximamente: Integración con DSPs</h3>
                        <p className="text-gray-400 text-sm mb-3">
                            Pronto podrás conectar tus cuentas de Spotify for Artists, Apple Music for Artists,
                            y otros distribuidores para ver tus regalías en tiempo real.
                        </p>
                        <button className="text-primary text-sm font-semibold hover:underline">
                            Notificarme cuando esté disponible →
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="glass-panel p-4 sm:p-5 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">Ganancias Totales</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary">${stats.totalEarnings.toFixed(2)}</h2>
                    <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        <span>0%</span>
                        <span className="text-gray-500">vs mes anterior</span>
                    </p>
                </div>
                <div className="glass-panel p-4 sm:p-5 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">Streams Totales</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{stats.streamsTotal.toLocaleString()}</h2>
                    <p className="text-xs text-gray-500 mt-2">Todas las plataformas</p>
                </div>
                <div className="glass-panel p-4 sm:p-5 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">Top Track</p>
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">{stats.topTrack || '--'}</h2>
                    <p className="text-xs text-gray-500 mt-2">Sin datos aún</p>
                </div>
                <div className="glass-panel p-4 sm:p-5 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-2">Pago Pendiente</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">${stats.pendingPayout.toFixed(2)}</h2>
                    <button className="text-xs text-primary hover:underline mt-2">Configurar método de pago</button>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-panel p-5 sm:p-6 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Ganancias por Tiempo</h3>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Composición
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            Master
                        </span>
                    </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 opacity-40">
                    {mockChartData.map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-t transition-all hover:from-primary/70 hover:to-primary"
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>Ene</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Abr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Ago</span>
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Dic</span>
                </div>
            </div>

            {/* Distribution by Platform */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="glass-panel p-5 sm:p-6 rounded-xl">
                    <h3 className="font-bold text-white mb-4">Distribución por Plataforma</h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Spotify', percentage: 0, color: 'bg-green-500' },
                            { name: 'Apple Music', percentage: 0, color: 'bg-pink-500' },
                            { name: 'YouTube Music', percentage: 0, color: 'bg-red-500' },
                            { name: 'Amazon Music', percentage: 0, color: 'bg-blue-500' },
                            { name: 'Otros', percentage: 0, color: 'bg-gray-500' },
                        ].map((platform) => (
                            <div key={platform.name} className="flex items-center gap-3">
                                <span className="w-24 text-sm text-gray-400">{platform.name}</span>
                                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${platform.color} rounded-full transition-all`}
                                        style={{ width: `${platform.percentage}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right text-sm text-gray-400">{platform.percentage}%</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-4 text-center">Conecta tus cuentas para ver datos reales</p>
                </div>

                <div className="glass-panel p-5 sm:p-6 rounded-xl">
                    <h3 className="font-bold text-white mb-4">Top Canciones</h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/50">
                                <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-500">{i}</span>
                                <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-gray-600">
                                    🎵
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 truncate">--</p>
                                    <p className="text-xs text-gray-600">Sin datos</p>
                                </div>
                                <span className="text-sm text-gray-500">$0.00</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Connect DSP CTA */}
            <div className="glass-panel p-6 rounded-xl text-center">
                <h3 className="text-lg font-bold text-white mb-2">Conecta tus Distribuidores</h3>
                <p className="text-gray-400 text-sm mb-4 max-w-lg mx-auto">
                    Para ver tus regalías en tiempo real, necesitas conectar tus cuentas de distribución musical.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <button className="px-4 py-2 bg-[#1DB954] text-white text-sm font-semibold rounded-full opacity-50 cursor-not-allowed">
                        Spotify for Artists
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm font-semibold rounded-full opacity-50 cursor-not-allowed">
                        Apple Music
                    </button>
                    <button className="px-4 py-2 bg-neutral-700 text-white text-sm font-semibold rounded-full opacity-50 cursor-not-allowed">
                        DistroKid
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-4">Próximamente disponible</p>
            </div>
        </div>
    );
}
