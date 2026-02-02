"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const toggleLanguage = () => {
        const nextLocale = locale === 'es' ? 'en' : 'es';
        startTransition(() => {
            const prefix = `/${locale}`;
            const pathWithoutLocale = pathname.startsWith(prefix)
                ? (pathname.slice(prefix.length) || '/')
                : pathname;

            const normalized = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
            const nextPath = `/${nextLocale}${normalized}`;

            const qs = searchParams?.toString();
            const href = qs ? `${nextPath}?${qs}` : nextPath;

            router.replace(href);
        });
    };

    return (
        <button
            onClick={toggleLanguage}
            disabled={isPending}
            className="px-3 py-1 rounded-full border border-white/20 text-xs text-white hover:bg-white/10 transition-colors uppercase font-bold"
        >
            {locale}
        </button>
    );
}
