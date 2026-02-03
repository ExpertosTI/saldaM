import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import AuthCallbackClient from '@/components/AuthCallbackClient';
import "../globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
    title: "Saldaña Music | Split Sheets Profesionales",
    description: "Gestión segura y colaborativa de derechos musicales.",
    icons: {
        icon: "/logo.svg",
        apple: "/logo.svg",
    },
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                <link rel="icon" href="/logo.svg" type="image/svg+xml" />
            </head>
            <body className={montserrat.className}>
                <NextIntlClientProvider messages={messages}>
                    <AuthCallbackClient />
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
