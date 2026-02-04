"use client";

import { useLocale } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const toggleLanguage = () => {
        const nextLocale = locale === 'es' ? 'en' : 'es';

        // Remove current locale prefix
        const prefix = `/${locale}`;
        const pathWithoutLocale = pathname.startsWith(prefix)
            ? (pathname.slice(prefix.length) || '/')
            : pathname;

        const normalized = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
        const nextPath = `/${nextLocale}${normalized}`;

        const qs = searchParams?.toString();
        const href = qs ? `${nextPath}?${qs}` : nextPath;

        // Force full page reload to ensure translations are refreshed
        window.location.href = href;
    };

    return (
        <button
            onClick={toggleLanguage}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-xs hover:bg-white/10 transition-all"
            title={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
            <span className="text-primary font-bold uppercase">{locale}</span>
            <svg className="w-3 h-3 text-white/50 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        </button>
    );
}
