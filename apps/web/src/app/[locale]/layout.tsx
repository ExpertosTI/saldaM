import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import AuthCallbackClient from '@/components/AuthCallbackClient';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import SplashScreen from '@/components/SplashScreen';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import "../globals.css";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const metadata: Metadata = {
    title: "Saldaña Music | Split Sheets Profesionales",
    description: "Gestión segura y colaborativa de derechos musicales.",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/logo.svg", type: "image/svg+xml" },
            { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Saldaña Music",
    },
};

export const viewport: Viewport = {
    themeColor: '#0a0a0a',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Saldaña Music" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="format-detection" content="telephone=no" />
            </head>
            <body className={montserrat.className}>
                <NextIntlClientProvider messages={messages}>
                    <GoogleAuthProvider>
                        <AuthCallbackClient />
                        <ServiceWorkerRegister />
                        <SplashScreen>
                            {children}
                        </SplashScreen>
                    </GoogleAuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

