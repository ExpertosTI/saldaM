
'use client';

import { useState } from 'react';

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        phone: '',
        proAffiliation: '',
        ipiNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);

    // Fetch user data on mount
    // For simplicity in this edit, we'll skip the useEffect fetch for now or rely on user filling it out.
    // Ideally we fetch from /api/auth/me if it existed or /api/users/profile if we made a GET.
    // I'll assume standard form behavior: User enters data to update.

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const tokenMatch = document.cookie.match(/token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile');
            }
        } catch (err) {
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>
            <div className="glass-panel p-8 rounded-xl max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                placeholder="Enter first name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">PRO Affiliation</label>
                            <select
                                name="proAffiliation"
                                value={formData.proAffiliation}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            >
                                <option value="">Select PRO</option>
                                <option value="ASCAP">ASCAP</option>
                                <option value="BMI">BMI</option>
                                <option value="SESAC">SESAC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">IPI Number</label>
                            <input
                                name="ipiNumber"
                                value={formData.ipiNumber}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                placeholder="000000000"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
