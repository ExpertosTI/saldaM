import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary)",
                "primary-foreground": "var(--primary-foreground)",
                secondary: "var(--surface)", // Mapping 'secondary' to surface for card backgrounds
                background: "var(--background)",
                surface: "var(--surface)",
                "surface-highlight": "var(--surface-highlight)",
                textMain: "var(--foreground)",
                textMuted: "var(--muted)",
                border: "var(--border)",
            },
            fontFamily: {
                sans: ["var(--font-montserrat)", "sans-serif"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
