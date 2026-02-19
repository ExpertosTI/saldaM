import './globals.css';

export default function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params?: { locale?: string };
}) {
    return (
        <html lang={params?.locale ?? 'es'} suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
