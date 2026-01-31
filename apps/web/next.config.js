import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    output: "standalone",
    poweredByHeader: false,
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
};

export default withNextIntl(nextConfig);
