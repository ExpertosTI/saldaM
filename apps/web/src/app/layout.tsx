import './globals.css';

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale?: string }>;
}) {
    const resolvedParams = await params;
    return (
        <html lang={resolvedParams?.locale ?? 'es'} suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
