import { getTranslations } from 'next-intl/server';
import DashboardShell from '@/components/dashboard/DashboardShell';

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
                    cache: 'no-store', // Ensure fresh data
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const user = await res.json();
                    if (!user.userType || user.userType === "") {
                        const { redirect } = await import('next/navigation');
                        redirect(`/${locale}/onboarding`);
                    }
                }
            }
        } catch (e) {
            console.error("Layout Auth Check Failed:", e);
            // If check fails, we don't block, but logging helps debug
        }
    }

    return (
        <DashboardShell
            memberPortalLabel={t('memberPortal')}
            navItems={[
                { name: t('dashboard'), href: `/${locale}/dashboard`, icon: 'dashboard' },
                { name: t('splitSheets'), href: `/${locale}/dashboard/split-sheets`, icon: 'splitSheets' },
                { name: t('collaborators'), href: `/${locale}/dashboard/collaborators`, icon: 'collaborators' },
                { name: t('profile'), href: `/${locale}/dashboard/profile`, icon: 'profile' },
                { name: t('royalties'), href: `/${locale}/dashboard/royalties`, icon: 'royalties' },
                { name: t('settings'), href: `/${locale}/dashboard/settings`, icon: 'settings' }
            ]}
        >
            {children}
        </DashboardShell>
    );
}
