/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    output: "standalone",
    poweredByHeader: false, // Security: Remove X-Powered-By: Next.js
    reactStrictMode: true,
    // Optimize for low-resource server
    images: {
        unoptimized: true, // Reduce server load for image optimization (let client handle it or CDN)
    },
    experimental: {
        // optimizeCss: true, // Needs peer dep critical
    }
};

export default nextConfig;
