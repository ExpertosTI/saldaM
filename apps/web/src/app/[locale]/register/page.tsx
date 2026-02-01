"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        userType: "ARTIST", // Default
    });
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                // Redirect to login or kyc
                router.push("/login?registered=true");
            } else {
                alert("Registration failed");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
            <div className="w-full max-w-lg p-8 glass-panel rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Logo & Decorative Gold Glow */}
                <Link href="/" className="flex flex-col items-center mb-6 hover:scale-105 transition-transform cursor-pointer">
                    <img src="/logo.svg" alt="Saldaña Music Logo" className="h-16 w-auto drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] mb-4" />
                    <div className="w-24 h-1 bg-primary shadow-[0_0_30px_2px_rgba(212,175,55,0.6)]"></div>
                </Link>

                <h2 className="text-3xl font-bold text-center text-primary mb-2 tracking-wider uppercase">JOIN THE ROSTER</h2>
                <p className="text-center text-gray-400 mb-8 text-sm">Professional Access for Music Creators</p>

                <div className="mb-6 flex flex-col gap-3">
                    <button
                        onClick={() => {
                            const width = 500;
                            const height = 600;
                            const left = window.screen.width / 2 - width / 2;
                            const top = window.screen.height / 2 - height / 2;

                            const popup = window.open(
                                `${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/auth/google`,
                                'Google_Auth',
                                `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no`
                            );

                            const handleMessage = (event: MessageEvent) => {
                                if (event.data?.token) {
                                    // SAVE TOKEN COOKIE
                                    document.cookie = `token=${event.data.token}; path=/; max-age=86400; SameSite=Lax`;

                                    popup?.close();

                                    if (event.data.isNewUser) {
                                        router.push('/onboarding');
                                    } else {
                                        router.push('/dashboard/profile');
                                    }

                                    window.removeEventListener('message', handleMessage);
                                }
                            };
                            window.addEventListener('message', handleMessage);
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Sign up with Google
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-neutral-700"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-xs">OR REGISTER WITH EMAIL</span>
                        <div className="flex-grow border-t border-neutral-700"></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">First Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Last Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">I am a...</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['ARTIST', 'PRODUCER', 'PUBLISHER'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, userType: type })}
                                    className={`py-2 px-1 rounded border text-xs font-bold transition-all ${formData.userType === type
                                        ? 'bg-primary text-black border-primary'
                                        : 'bg-transparent text-gray-400 border-neutral-700 hover:border-gray-500'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-primary outline-none text-white"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-primary text-black font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500 transition-all"
                    >
                        {loading ? 'Creating Profile...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
                </p>
            </div>
        </main>
    );
}
