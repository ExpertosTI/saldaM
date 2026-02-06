const routing = {
    locales: ['es', 'en'],
    defaultLocale: 'es'
};

// DEBUG LOGS
console.log(`[Middleware] Processing request for: ${pathname}`);

// 1. Skip Auth Check for Public Assets / API
if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // files like favicon.ico, etc.
) {
    return NextResponse.next();
}

// 2. Check for Auth Token (cookie)
const token = req.cookies.get('token')?.value;
console.log(`[Middleware] Token present: ${!!token}`);

// 3. Define Protected Routes pattern
// Checks for /en/dashboard, /es/dashboard, or just /dashboard
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
return intlMiddleware(req);
}

export const config = {
    // Match all pathnames except for specific API/System paths
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
