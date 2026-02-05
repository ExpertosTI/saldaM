"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

// Client ID should match what's configured in Google Cloud Console
// Using env variable with fallback for local development
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '609647959676-ujoqo6p8qe10ehu3cro2i26ci8nnks8j.apps.googleusercontent.com';

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
