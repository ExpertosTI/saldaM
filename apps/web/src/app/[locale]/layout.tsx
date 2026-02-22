import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import SplashScreen from '@/components/SplashScreen';
import GoogleAuthProvider from '@/components/GoogleAuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ToastProvider';

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
    other: {
        "format-detection": "telephone=no",
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
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
        <div className={montserrat.className} lang={locale}>
            <NextIntlClientProvider messages={messages}>
                <GoogleAuthProvider>
                    <ServiceWorkerRegister />
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                        <ToastProvider>
                            <SplashScreen>
                                {children}
                            </SplashScreen>
                        </ToastProvider>
                    </ThemeProvider>
                </GoogleAuthProvider>
            </NextIntlClientProvider>
        </div>
    );
}

