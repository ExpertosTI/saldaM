'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Check if this is the first load in session
        const hasLoaded = sessionStorage.getItem('app_loaded');

        if (hasLoaded) {
            setLoading(false);
            return;
        }

        // Show splash for minimum time, then fade out
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                setLoading(false);
                sessionStorage.setItem('app_loaded', 'true');
            }, 500);
        }, 1800);

        return () => clearTimeout(timer);
    }, []);

    if (!loading) {
        return <>{children}</>;
    }

    return (
        <>
            <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
                <div className="splash-content">
                    {/* Animated Logo */}
                    <div className="logo-container">
                        <div className="logo-glow"></div>
                        <Image
                            src="/logo.svg"
                            alt="Saldaña Music"
                            width={120}
                            height={120}
                            className="splash-logo"
                            priority
                        />
                    </div>

                    {/* Brand Name */}
                    <h1 className="splash-title">SALDAÑA</h1>
                    <p className="splash-subtitle">MUSIC</p>

                    {/* Loading indicator */}
                    <div className="splash-loader">
                        <div className="loader-bar"></div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'none' }}>{children}</div>

            <style jsx>{`
                .splash-screen {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 1;
                    transition: opacity 0.5s ease-out;
                }

                .splash-screen.fade-out {
                    opacity: 0;
                    pointer-events: none;
                }

                .splash-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    animation: fadeIn 0.6s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .logo-container {
                    position: relative;
                    margin-bottom: 24px;
                }

                .logo-glow {
                    position: absolute;
                    inset: -20px;
                    background: radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%);
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.8;
                    }
                }

                .splash-logo {
                    position: relative;
                    z-index: 1;
                    animation: logoFloat 3s ease-in-out infinite;
                    filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.5));
                }

                @keyframes logoFloat {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }

                .splash-title {
                    font-size: 32px;
                    font-weight: 800;
                    letter-spacing: 12px;
                    color: #D4AF37;
                    margin: 0;
                    animation: shimmer 3s linear infinite;
                    background: linear-gradient(
                        90deg,
                        #D4AF37 0%,
                        #FFFFFF 25%,
                        #D4AF37 50%,
                        #FFFFFF 75%,
                        #D4AF37 100%
                    );
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                @keyframes shimmer {
                    to {
                        background-position: 200% center;
                    }
                }

                .splash-subtitle {
                    font-size: 14px;
                    letter-spacing: 8px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-top: 4px;
                    margin-bottom: 32px;
                }

                .splash-loader {
                    width: 120px;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .loader-bar {
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, #D4AF37, #FFFFFF, #D4AF37);
                    border-radius: 4px;
                    animation: loading 1.5s ease-out forwards;
                }

                @keyframes loading {
                    0% {
                        width: 0%;
                    }
                    100% {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}
