'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getToken, removeToken, API_BASE_URL } from '@/lib/auth';

interface UserData {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    userType: string | null;
}

export default function Sidebar() {
    const locale = useLocale();
    const pathname = usePathname();
    const t = useTranslations('Dashboard.nav');
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = getToken();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (e) {
                console.error('Failed to fetch user', e);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        removeToken();
        document.cookie = 'saldana_is_new_user=; path=/; max-age=0';
        window.location.href = `/${locale}/login`;
    };

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + '/');
    };

    const navItems = [
        { href: `/${locale}/dashboard`, label: t('dashboard'), icon: 'home' },
        { href: `/${locale}/dashboard/split-sheets`, label: t('splitSheets'), icon: 'document' },
        { href: `/${locale}/dashboard/collaborators`, label: t('collaborators'), icon: 'users' },
        { href: `/${locale}/dashboard/profile`, label: t('profile'), icon: 'user' },
        { href: `/${locale}/dashboard/royalties`, label: t('royalties'), icon: 'chart' },
        { href: `/${locale}/dashboard/settings`, label: t('settings'), icon: 'settings' },
    ];

    const getIcon = (icon: string) => {
        switch (icon) {
            case 'home':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
            case 'document':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
            case 'users':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
            case 'user':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
            case 'chart':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
            case 'settings':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />;
            default:
                return null;
        }
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
                <Link href={`/${locale}`} className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                    <span className="text-lg font-bold tracking-wider text-white">SALDAÑA</span>
                </Link>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-screen w-64 bg-black/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-50
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:top-0 top-16
                lg:h-screen h-[calc(100vh-4rem)]
            `}>
                {/* Logo - Hidden on mobile (shown in header) */}
                <div className="p-6 border-b border-white/5 hidden lg:block">
                    <Link href={`/${locale}`} className="flex items-center gap-3 group">
                        <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-[0.15em] text-white leading-none">SALDAÑA</span>
                            <span className="text-[0.5rem] tracking-[0.5em] text-primary/80 uppercase font-light leading-none mt-0.5">MUSIC</span>
                        </div>
                    </Link>
                </div>

                {/* User Profile Section */}
                <div className="p-4 border-b border-white/5">
                    {loading ? (
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-neutral-800 animate-pulse" />
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse mb-2" />
                                <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse" />
                            </div>
                        </div>
                    ) : user ? (
                        <Link href={`/${locale}/dashboard/profile`} className="flex items-center gap-3 group hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.firstName || 'Usuario'}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {(user.firstName?.[0] || user.email[0] || '?').toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm truncate">
                                    {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.firstName || user.email.split('@')[0]}
                                </p>
                                <p className="text-gray-500 text-xs truncate">
                                    {user.userType || 'Miembro'}
                                </p>
                            </div>
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ) : (
                        <Link href={`/${locale}/login`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-sm">Iniciar Sesión</span>
                        </Link>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <p className="text-[0.65rem] text-gray-600 uppercase tracking-wider font-semibold mb-4 px-2">{t('memberPortal')}</p>
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive(item.href)
                                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {getIcon(item.icon)}
                                    </svg>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer with Language & Logout */}
                <div className="p-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <LanguageSwitcher />
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Salir
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
