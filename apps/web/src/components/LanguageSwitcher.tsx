"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const toggleLanguage = () => {
        const nextLocale = locale === 'es' ? 'en' : 'es';
        startTransition(() => {
            // Very simple replacement for now, in a robust app use next-intl/navigation's Link/useRouter
            const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
            // Fallback if path doesn't start with locale (homepage root)
            const finalPath = newPath === pathname ? `/${nextLocale}${pathname}` : newPath;

            router.replace(finalPath);
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
