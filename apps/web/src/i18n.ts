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

    // In Docker standalone, process.cwd() is /app
    // We copied messages to /app/apps/web/messages
    const messagesPath = path.resolve(process.cwd(), 'apps/web/messages', `${locale}.json`);

    let messages;
    try {
        const fileContents = fs.readFileSync(messagesPath, 'utf8');
        messages = JSON.parse(fileContents);
    } catch (error) {
        // Fallback to empty
        messages = {};
    }

    return {
        locale,
        messages
    };
});
