/**
 * Authentication Utilities
 * Centralized auth functions to avoid code repetition
 */

// API Base URL - single source of truth
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api';

/**
 * Get authentication token from cookies (client-side)
 * Falls back to localStorage if cookie is not accessible (e.g., Secure cookie on non-HTTPS)
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try cookie first
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/token=([^;]+)/);
        if (match?.[1]) return match[1];
    }

    // Fallback to localStorage
    try {
        const stored = localStorage.getItem('saldana_auth');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.token) {
                // Verify token is not expired (basic check)
                if (parsed.ts && Date.now() - parsed.ts < 86400000) { // 24 hours
                    return parsed.token;
                }
            }
        }
    } catch (e) {
        console.error('Error reading token from localStorage', e);
    }

    return null;
}

/**
 * Set authentication token in cookies (client-side)
 */
export function setToken(token: string, maxAge: number = 86400): void {
    if (typeof document === 'undefined') return;
    document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Remove authentication token (logout)
 * Clears cookies both with and without domain for full cleanup
 */
export function removeToken(): void {
    if (typeof document !== 'undefined') {
        // Clear cookies without domain (local)
        document.cookie = 'token=; path=/; max-age=0';
        document.cookie = 'saldana_is_new_user=; path=/; max-age=0';
        document.cookie = 'saldana_popup=; path=/; max-age=0';

        // Clear cookies WITH domain (production - .saldanamusic.com)
        if (window.location.hostname.endsWith('saldanamusic.com')) {
            const domain = '; Domain=.saldanamusic.com';
            document.cookie = `token=; path=/; max-age=0${domain}`;
            document.cookie = `saldana_is_new_user=; path=/; max-age=0${domain}`;
            document.cookie = `saldana_popup=; path=/; max-age=0${domain}`;
        }
    }

    // Also clear localStorage
    try {
        localStorage.removeItem('saldana_auth');
        localStorage.removeItem('token');
        localStorage.removeItem('sm_loaded');
    } catch (e) {
        console.error('Error clearing localStorage', e);
    }

    // Clear sessionStorage
    try {
        sessionStorage.clear();
    } catch (e) {
        console.error('Error clearing sessionStorage', e);
    }
}

/**
 * Decode JWT payload (client-side, no verification)
 */
export function decodeToken(token: string): { sub?: string; email?: string; exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = JSON.parse(atob(parts[1]!));
        return payload;
    } catch {
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
}

/**
 * Get current user ID from token
 */
export function getCurrentUserId(): string | null {
    const token = getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    return payload?.sub || null;
}

/**
 * Get current user email from token
 */
export function getCurrentUserEmail(): string | null {
    const token = getToken();
    if (!token) return null;
    const payload = decodeToken(token);
    return payload?.email || null;
}

/**
 * Authenticated fetch wrapper
 */
export async function authFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getToken();

    const headers: HeadersInit = {
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
}

/**
 * Authenticated fetch with JSON parsing
 */
export async function authFetchJson<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
    try {
        const response = await authFetch(endpoint, options);
        const status = response.status;

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                data: null,
                error: errorData.message || `HTTP Error: ${status}`,
                status,
            };
        }

        const data = await response.json();
        return { data, error: null, status };
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err.message : 'Network error',
            status: 0,
        };
    }
}
