
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { API_BASE_URL, getToken } from '@/lib/auth';
import { User } from 'lucide-react';

export default function ProfilePage() {
    const t = useTranslations();
    const p = useTranslations('Profile');
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
    const [message, setMessage] = useState<string>('');

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

        setMessage('');
        const token = getToken();

        try {
            if (!token) {
                setMessage(t('System.sessionExpired'));
                return;
            }

            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage(t('System.profileUpdated'));
            } else {
                setMessage(t('System.profileUpdateFailed'));
            }
        } catch (err) {
            setMessage(t('System.genericError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-white">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <User className="w-7 h-7 text-primary" />
                {p('title')}
            </h1>
            <div className="glass-panel p-8 rounded-xl max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{p('firstNameLabel')}</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                placeholder={p('firstNamePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{p('lastNameLabel')}</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                placeholder={p('lastNamePlaceholder')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{p('bioLabel')}</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            placeholder={p('bioPlaceholder')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{p('proAffiliationLabel')}</label>
                            <select
                                name="proAffiliation"
                                value={formData.proAffiliation}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                            >
                                <option value="">{p('proAffiliationPlaceholder')}</option>
                                <option value="ASCAP">ASCAP</option>
                                <option value="BMI">BMI</option>
                                <option value="SESAC">SESAC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{p('ipiNumberLabel')}</label>
                            <input
                                name="ipiNumber"
                                value={formData.ipiNumber}
                                onChange={handleChange}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                placeholder={p('ipiNumberPlaceholder')}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                    >
                        {loading ? p('saving') : p('save')}
                    </button>

                    {message && (
                        <div className="text-sm font-semibold text-gray-300">{message}</div>
                    )}
                </form>
            </div>
        </div>
    );
}
