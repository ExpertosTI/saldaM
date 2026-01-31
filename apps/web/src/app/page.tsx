import { redirect } from 'next/navigation';

// Root page should redirect to the default locale
// This prevents the "Root Layout" error confusion by keeping this file simple
// and delegates strict rendering to [locale]/page.tsx
export default function RootPage() {
    redirect('/es');
}
