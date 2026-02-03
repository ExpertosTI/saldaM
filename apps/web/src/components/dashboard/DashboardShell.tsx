"use client";

import Link from 'next/link';
import { useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Menu, X, LayoutDashboard, FileText, Users, User, DollarSign, Settings } from 'lucide-react';

type NavItem = {
    name: string;
    href: string;
    icon: 'dashboard' | 'splitSheets' | 'collaborators' | 'profile' | 'royalties' | 'settings';
};

function NavIcon({ icon }: { icon: NavItem['icon'] }) {
    const cls = 'w-4 h-4';
    switch (icon) {
        case 'dashboard':
            return <LayoutDashboard className={cls} />;
        case 'splitSheets':
            return <FileText className={cls} />;
        case 'collaborators':
            return <Users className={cls} />;
        case 'profile':
            return <User className={cls} />;
        case 'royalties':
            return <DollarSign className={cls} />;
        case 'settings':
            return <Settings className={cls} />;
        default:
            return <LayoutDashboard className={cls} />;
    }
}

export default function DashboardShell({
    navItems,
    memberPortalLabel,
    children
}: {
    navItems: NavItem[];
    memberPortalLabel: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="w-64 border-r border-neutral-800 hidden md:block">
                <div className="p-6 flex flex-col items-center border-b border-neutral-800/50 mb-6">
                    <img src="/logo.svg" alt="Saldaña Music" className="h-14 w-auto drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
                    <div className="mt-2 text-[0.6rem] tracking-[0.4em] text-primary uppercase font-bold">
                        {memberPortalLabel}
                    </div>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-primary rounded-lg transition-colors">
                            <NavIcon icon={item.icon} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-10 left-0 w-64 px-10">
                    <LanguageSwitcher />
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                <div className="md:hidden sticky top-0 z-50 border-b border-white/5 bg-black/30 backdrop-blur-md">
                    <div className="h-14 px-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <img src="/logo.svg" alt="Saldaña Music" className="h-8 w-auto" />
                        <LanguageSwitcher />
                    </div>
                </div>

                {open && (
                    <div className="fixed inset-0 z-[60] md:hidden">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#050505] border-r border-white/10 p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.svg" alt="Saldaña Music" className="h-10 w-auto" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-primary rounded-lg transition-colors"
                                    >
                                        <NavIcon icon={item.icon} />
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
