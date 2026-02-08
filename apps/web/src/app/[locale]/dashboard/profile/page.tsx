'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getToken, API_BASE_URL } from '@/lib/auth';

interface UserProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    phone: string | null;
    avatarUrl: string | null;
    userType: string | null;
    proAffiliation: string | null;
    ipiNumber: string | null;
    publishingCompany: string | null;
    createdAt: string;
}

export default function ProfilePage() {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations('Profile');
    const s = useTranslations('System');

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [userType, setUserType] = useState<string>('');
    const [proAffiliation, setProAffiliation] = useState('');
    const [ipiNumber, setIpiNumber] = useState('');
    const [publishingCompany, setPublishingCompany] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = getToken();
            if (!token) {
                router.push(`/${locale}/login`);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data: UserProfile = await res.json();
                    setUser(data);
                    // Populate form
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    setBio(data.bio || '');
                    setPhone(data.phone || '');
                    setUserType(data.userType || '');
                    setProAffiliation(data.proAffiliation || '');
                    setIpiNumber(data.ipiNumber || '');
                    setPublishingCompany(data.publishingCompany || '');
                } else if (res.status === 401) {
                    router.push(`/${locale}/login`);
                }
            } catch (e) {
                console.error('Failed to fetch profile', e);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [locale, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const token = getToken();
        if (!token) {
            router.push(`/${locale}/login`);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    bio,
                    phone,
                    userType: userType || undefined,
                    proAffiliation: proAffiliation || undefined,
                    ipiNumber: ipiNumber || undefined,
                    publishingCompany: publishingCompany || undefined,
                })
            });

            if (res.ok) {
                const updated = await res.json();
                setUser(updated);
                setMessage({ type: 'success', text: s('profileUpdated') });
            } else {
                setMessage({ type: 'error', text: s('profileUpdateFailed') });
            }
        } catch (e) {
            setMessage({ type: 'error', text: s('genericError') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">{t('loading') || 'Cargando...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
                <p className="text-gray-400">Administra tu información personal y profesional.</p>
            </header>

            {/* Profile Card */}
            <div className="glass-panel rounded-2xl p-8 mb-8">
                <div className="flex items-start gap-6 mb-8">
                    {/* Avatar */}
                    <div className="relative group">
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.firstName || 'Usuario'}
                                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary/20"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
                                {(user?.firstName?.[0] || user?.email[0] || '?').toUpperCase()}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs text-white">Google</span>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-textMain mb-1">
                            {user?.firstName && user?.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user?.firstName || 'Nuevo Usuario'}
                        </h2>
                        <p className="text-textMuted text-sm mb-3">{user?.email}</p>
                        <div className="flex gap-2">
                            {user?.userType && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                                    {user.userType}
                                </span>
                            )}
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-textMuted border border-white/10">
                                Miembro desde {new Date(user?.createdAt || '').getFullYear()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-3">Tipo de Usuario</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['ARTIST', 'PRODUCER', 'PUBLISHER'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setUserType(type)}
                                    className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${userType === type
                                        ? 'bg-primary/20 text-primary border-primary'
                                        : 'bg-surface-highlight text-textMuted border-border hover:border-gray-500 hover:text-textMain'
                                        }`}
                                >
                                    {type === 'ARTIST' ? 'Artista' : type === 'PRODUCER' ? 'Productor' : 'Publisher'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">{t('firstNameLabel')}</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder={t('firstNamePlaceholder')}
                                className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-textMain placeholder-textMuted transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">{t('lastNameLabel')}</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder={t('lastNamePlaceholder')}
                                className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-textMain placeholder-textMuted transition-all"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">{t('bioLabel')}</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder={t('bioPlaceholder')}
                            rows={3}
                            className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-textMain placeholder-textMuted transition-all resize-none"
                        />
                    </div>

                    {/* Professional Info */}
                    <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-textMain mb-4">Información Profesional</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">{t('proAffiliationLabel')}</label>
                                <select
                                    value={proAffiliation}
                                    onChange={(e) => setProAffiliation(e.target.value)}
                                    className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-textMain transition-all"
                                >
                                    <option value="">{t('proAffiliationPlaceholder')}</option>
                                    <option value="ASCAP">ASCAP</option>
                                    <option value="BMI">BMI</option>
                                    <option value="SESAC">SESAC</option>
                                    <option value="GMR">GMR</option>
                                    <option value="SOCAN">SOCAN</option>
                                    <option value="SGAE">SGAE</option>
                                    <option value="PRS">PRS for Music</option>
                                    <option value="SACEM">SACEM</option>
                                    <option value="OTHER">Otra</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-2">{t('ipiNumberLabel')}</label>
                                <input
                                    type="text"
                                    value={ipiNumber}
                                    onChange={(e) => setIpiNumber(e.target.value)}
                                    placeholder={t('ipiNumberPlaceholder')}
                                    className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-textMain placeholder-textMuted transition-all"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-textMuted mb-2">Compañía Editorial</label>
                            <input
                                type="text"
                                value={publishingCompany}
                                onChange={(e) => setPublishingCompany(e.target.value)}
                                placeholder="Nombre de tu compañía editorial (si aplica)"
                                className="w-full px-4 py-3 bg-surface-highlight border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-textMain placeholder-textMuted transition-all"
                            />
                        </div>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-primary text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                        >
                            {saving ? t('saving') : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
