"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState<string | null>(null);

    const handleSave = async () => {
        if (!userType) return;
        setLoading(true);
        try {
            // Get token from cookie manually since we are in client component
            const tokenMatch = document.cookie.match(/token=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;

            if (!token) {
                alert("Session expired. Please login again.");
                router.push('/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/users/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ userType }),
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-lg p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden text-center">
                <h2 className="text-3xl font-bold text-primary mb-4 tracking-wider uppercase">COMPLETE YOUR PROFILE</h2>
                <p className="text-gray-400 mb-8">Select your primary role to continue.</p>

                <div className="grid grid-cols-1 gap-4 mb-8">
                    {['ARTIST', 'PRODUCER', 'PUBLISHER'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setUserType(type)}
                            className={`p-4 rounded-xl border-2 transition-all font-bold tracking-widest ${userType === type
                                    ? 'bg-primary text-black border-primary scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                    : 'bg-neutral-900 text-gray-400 border-neutral-700 hover:border-gray-500 hover:text-white'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    disabled={!userType || loading}
                    className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? 'SAVING...' : 'CONTINUE TO DASHBOARD'}
                </button>
            </div>
        </main>
    );
}
