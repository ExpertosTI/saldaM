/**
 * Authentication Utilities
 * Centralized auth functions to avoid code repetition
 */

// API Base URL - single source of truth
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api';

/**
 * Get authentication token from cookies (client-side)
 */
export function getToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/token=([^;]+)/);
    return match?.[1] ?? null;
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
 */
export function removeToken(): void {
    if (typeof document === 'undefined') return;
    document.cookie = 'token=; path=/; max-age=0';
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
