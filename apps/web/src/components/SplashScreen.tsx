'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Check if already loaded in this session
        if (typeof window !== 'undefined') {
            const hasLoaded = sessionStorage.getItem('sm_loaded');
            if (hasLoaded) {
                setIsVisible(false);
                return;
            }
        }

        // Start fade out after delay
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                setIsVisible(false);
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('sm_loaded', '1');
                }
            }, 600);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) {
        return <>{children}</>;
    }

    return (
        <>
            {/* Splash Screen */}
            <div
                className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
                style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' }}
            >
                <div className="flex flex-col items-center animate-fade-in">
                    {/* Logo with glow */}
                    <div className="relative mb-6">
                        {/* Glow effect */}
                        <div
                            className="absolute -inset-6 rounded-full animate-pulse"
                            style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)' }}
                        />
                        {/* Logo */}
                        <Image
                            src="/logo.svg"
                            alt="Saldaña Music"
                            width={100}
                            height={100}
                            priority
                            className="relative z-10 animate-float drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                        />
                    </div>

                    {/* Brand text */}
                    <h1
                        className="text-2xl font-extrabold tracking-[0.4em] mb-1 animate-shimmer bg-clip-text text-transparent"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #D4AF37 0%, #FFFFFF 25%, #D4AF37 50%, #FFFFFF 75%, #D4AF37 100%)',
                            backgroundSize: '200% auto',
                        }}
                    >
                        SALDAÑA
                    </h1>
                    <p className="text-xs tracking-[0.5em] text-white/50 mb-8">MUSIC</p>

                    {/* Loading bar */}
                    <div className="w-24 h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full animate-load-bar"
                            style={{ background: 'linear-gradient(90deg, #D4AF37, #FFFFFF, #D4AF37)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Preload content hidden */}
            <div className="hidden">{children}</div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes shimmer {
                    to { background-position: 200% center; }
                }
                @keyframes load-bar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                .animate-fade-in { animation: fade-in 0.6s ease-out; }
                .animate-float { animation: float 2.5s ease-in-out infinite; }
                .animate-shimmer { animation: shimmer 2s linear infinite; }
                .animate-load-bar { animation: load-bar 1.6s ease-out forwards; }
            `}</style>
        </>
    );
}
