import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const routing = {
    locales: ['es', 'en'],
    defaultLocale: 'es'
};

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Skip Auth Check for Public Assets / API
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // files like favicon.ico, etc.
    ) {
        const res = NextResponse.next();
        res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
        res.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
        return res;
    }

    // 2. Check for Auth Token (cookie)
    const token = req.cookies.get('token')?.value;

    // 3. Define Protected Routes pattern
    const isProtectedRoute = pathname.includes('/dashboard') ||
        pathname.includes('/regalias') ||
        pathname.includes('/settings');

    // 4. Define Auth Routes (Login/Register)
    const isAuthRoute = pathname.includes('/login') || pathname.includes('/register');

    // SCENARIO A: Unauthenticated User tries to access Protected Route -> Redirect to Login
    if (isProtectedRoute && !token) {
        // Preserve locale if present, default to 'es'
        const locale = pathname.startsWith('/en') ? 'en' : 'es';
        const loginUrl = new URL(`/${locale}/login`, req.url);
        // Optional: Add redirect param to return after login
        // loginUrl.searchParams.set('redirect', pathname); 
        return NextResponse.redirect(loginUrl);
    }

    // SCENARIO B: Authenticated User tries to access Auth Route -> Redirect to Dashboard
    if (isAuthRoute && token) {
        const locale = pathname.startsWith('/en') ? 'en' : 'es';
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }

    // 5. If checks pass, run Internationalization Middleware
    const res = intlMiddleware(req);
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    return res;
}

export const config = {
    // Match all pathnames except for specific API/System paths
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
