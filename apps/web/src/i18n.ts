import { getRequestConfig } from 'next-intl/server';
import { routing } from './middleware'; // Import routing to share locales

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    // Use fs to read the file to potentially debug path issues and avoid webpack chunks issues in standalone
    const fs = await import('fs');
    const path = await import('path');

    let messages;
    try {
        const candidates = [
            path.resolve(process.cwd(), 'apps/web/messages', `${locale}.json`),
            path.resolve(process.cwd(), 'messages', `${locale}.json`)
        ];

        let fileContents: string | null = null;
        for (const candidate of candidates) {
            try {
                if (fs.existsSync(candidate)) {
                    fileContents = fs.readFileSync(candidate, 'utf8');
                    break;
                }
            } catch { }
        }

        messages = fileContents ? JSON.parse(fileContents) : {};
    } catch (error) {
        // Fallback to empty
        messages = {};
    }

    return {
        locale,
        messages
    };
});
