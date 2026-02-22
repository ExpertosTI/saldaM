"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

// Client ID from environment variable (set in docker-stack.yml)
// Both API and Web need the same GOOGLE_CLIENT_ID for token verification to work
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '609647959676-acjcpqrq4oghnanp2288f1e9jkf7fnp4.apps.googleusercontent.com';

interface GoogleAuthProviderProps {
    children: ReactNode;
}

export default function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
}
