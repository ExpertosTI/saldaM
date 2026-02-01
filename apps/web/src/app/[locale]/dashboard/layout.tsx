import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const t = await getTranslations('Dashboard.nav');

    // Robustness Check: Ensure User has completed onboarding
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
        try {
            // Decode payload to get email
            const parts = token.split('.');
            if (parts.length < 2) throw new Error('Invalid token');
            const payload = JSON.parse(atob(parts[1]!));
            const email = payload.email;

            if (email) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/users/${email}`, {
                    cache: 'no-store' // Ensure fresh data
                });
                if (res.ok) {
                    const user = await res.json();
                    if (!user.userType || user.userType === "") {
                        const { redirect } = await import('next/navigation');
                        redirect('/onboarding');
                    }
                }
            }
        } catch (e) {
            console.error("Layout Auth Check Failed:", e);
            // If check fails, we don't block, but logging helps debug
        }
    }

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
                    {[
                        { name: t('dashboard'), href: `/${locale}/dashboard` },
                        { name: t('splitSheets'), href: `/${locale}/dashboard/split-sheets` },
                        { name: t('collaborators'), href: `/${locale}/dashboard/collaborators` },
                        { name: t('profile'), href: `/${locale}/dashboard/profile` }, // Added Profile link
                        { name: t('royalties'), href: `/${locale}/dashboard/royalties` },
                        { name: t('settings'), href: `/${locale}/dashboard/settings` },
                    ].map((item) => (
                        <Link key={item.href} href={item.href} className="block px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-primary rounded-lg transition-colors">
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-10 left-0 w-64 px-10">
                    <LanguageSwitcher />
                </div>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
