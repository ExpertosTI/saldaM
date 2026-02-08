"use client";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { API_BASE_URL, getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

type Role = "Songwriter" | "Producer" | "Publisher";

type Collaborator = {
    name: string;
    email: string;
    role: Role;
    percentage: number;
    isOwner?: boolean;
};

interface UserData {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: string | null;
    proAffiliation: string | null;
    ipiNumber: string | null;
}

export default function CreateSplitSheet() {
    const t = useTranslations('SplitSheet');
    const s = useTranslations('System');
    const locale = useLocale();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUser = async () => {
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
                    const data: UserData = await res.json();
                    setUser(data);

                    // Set initial collaborator with user's real data
                    const displayName = data.firstName && data.lastName
                        ? `${data.firstName} ${data.lastName}`
                        : data.firstName || data.email.split('@')[0];

                    const userRole: Role = data.userType === 'PRODUCER' ? 'Producer'
                        : data.userType === 'PUBLISHER' ? 'Publisher'
                            : 'Songwriter';

                    setCollaborators([{
                        name: `${displayName} ${t('ownerLabel')}`,
                        email: data.email,
                        role: userRole,
                        percentage: 100,
                        isOwner: true
                    }]);
                } else if (res.status === 401) {
                    router.push(`/${locale}/login`);
                }
            } catch (e) {
                console.error('Failed to fetch user', e);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [locale, router, t]);

    const addCollaborator = () => {
        // Recalculate percentages when adding
        const newPercentage = Math.floor(100 / (collaborators.length + 1));
        const updatedCollabs = collaborators.map(c => ({
            ...c,
            percentage: newPercentage
        }));
        setCollaborators([...updatedCollabs, {
            name: "",
            email: "",
            role: "Songwriter",
            percentage: newPercentage,
            isOwner: false
        }]);
    };

    const removeCollaborator = (index: number) => {
        if (collaborators[index]?.isOwner) return; // Can't remove owner
        const newCollabs = collaborators.filter((_, i) => i !== index);
        // Recalculate percentages
        const newPercentage = Math.floor(100 / newCollabs.length);
        const remainder = 100 - (newPercentage * newCollabs.length);
        setCollaborators(newCollabs.map((c, i) => ({
            ...c,
            percentage: i === 0 ? newPercentage + remainder : newPercentage
        })));
    };

    const updateCollaborator = (index: number, field: keyof Collaborator, value: any) => {
        const newCollabs = [...collaborators];
        // @ts-ignore
        newCollabs[index][field] = value;
        setCollaborators(newCollabs);
    };

    const totalPercentage = collaborators.reduce((sum, c) => sum + Number(c.percentage || 0), 0);
    const isValid = totalPercentage === 100 && title.trim().length > 0;

    const handleSaveDraft = async () => {
        if (!title.trim()) return;
        await handleSave('DRAFT');
    };

    const handleGenerate = async () => {
        if (!isValid) return;
        await handleSave('PENDING_SIGNATURES');
    };

    const handleSave = async (status: string) => {
        try {
            setSaving(true);
            setMessage(null);
            const token = getToken();
            if (!token) {
                setMessage({ type: 'error', text: s('pleaseLogin') });
                return;
            }

            const payload = {
                title,
                collaborators: collaborators.map(c => ({
                    name: c.name.replace(` ${t('ownerLabel')}`, ''),
                    email: c.email || undefined,
                    role: c.role.toUpperCase(),
                    percentage: c.percentage
                })),
                status
            };

            const res = await fetch(`${API_BASE_URL}/split-sheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setMessage({ type: 'success', text: status === 'DRAFT' ? s('draftSaved') : s('splitSheetCreated') });
                // Redirect to the split sheet
                setTimeout(() => {
                    router.push(`/${locale}/dashboard`);
                }, 1500);
            } else {
                setMessage({ type: 'error', text: s('splitSheetCreateFailed') });
            }
        } catch (error) {
            console.error(error);
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
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">{t('createTitle')}</h1>

            <div className="glass-panel p-6 sm:p-8 rounded-2xl mb-8 border border-white/10 dark:border-white/10 shadow-lg dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <label className="block text-primary/80 text-sm font-bold uppercase tracking-wider mb-2">{t('songTitle')}</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-border text-xl sm:text-3xl font-bold text-textMain focus:border-primary outline-none py-3 transition-all placeholder-textMuted"
                    placeholder={t('songTitlePlaceholder')}
                />
            </div>

            <div className="space-y-4 mb-8">
                <h2 className="text-xl font-bold text-textMain flex justify-between items-center px-2">
                    {t('collaborators')}
                    <span className={`text-sm py-1.5 px-4 rounded-full font-bold shadow-lg ${totalPercentage === 100
                        ? 'bg-gradient-to-r from-green-900/80 to-green-800/80 text-green-400 border border-green-500/30'
                        : 'bg-gradient-to-r from-red-900/80 to-red-800/80 text-red-400 border border-red-500/30'
                        }`}>
                        {t('total')}: {totalPercentage}%
                    </span>
                </h2>

                <div className="space-y-3">
                    {collaborators.map((c, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 hover:border-white/10 dark:hover:border-white/10 transition-all group">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                <div className="flex-1">
                                    <label className="text-xs text-textMuted mb-1 block sm:hidden">Nombre / Email</label>
                                    <input
                                        type="text"
                                        placeholder={t('collaboratorPlaceholder')}
                                        className={`w-full bg-surface-highlight border border-border rounded-lg p-3 text-textMain focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all ${c.isOwner ? 'opacity-75 cursor-not-allowed' : ''}`}
                                        value={c.name}
                                        onChange={(e) => updateCollaborator(i, 'name', e.target.value)}
                                        readOnly={c.isOwner}
                                    />
                                </div>
                                <div className="sm:w-40">
                                    <label className="text-xs text-textMuted mb-1 block sm:hidden">Rol</label>
                                    <select
                                        className="w-full bg-surface-highlight border border-border rounded-lg p-3 text-textMain outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                        value={c.role}
                                        onChange={(e) => updateCollaborator(i, 'role', e.target.value)}
                                    >
                                        <option value="Songwriter">{t('roles.songwriter')}</option>
                                        <option value="Producer">{t('roles.producer')}</option>
                                        <option value="Publisher">{t('roles.publisher')}</option>
                                    </select>
                                </div>
                                <div className="w-28 relative">
                                    <label className="text-xs text-textMuted mb-1 block sm:hidden">Porcentaje</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full bg-surface-highlight border border-border rounded-lg p-3 text-textMain focus:border-primary outline-none text-right pr-10 font-mono font-bold"
                                        value={c.percentage}
                                        onChange={(e) => updateCollaborator(i, 'percentage', parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="absolute right-4 top-3 sm:top-3.5 text-textMuted font-bold">%</span>
                                </div>
                                {!c.isOwner && (
                                    <button
                                        onClick={() => removeCollaborator(i)}
                                        className="p-3 text-textMuted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Eliminar"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        onClick={addCollaborator}
                        className="group flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-full hover:border-primary/50 hover:bg-surface-highlight transition-all text-sm font-bold text-textMuted hover:text-textMain"
                    >
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">+</span>
                        {t('addCollaborator')}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                    onClick={handleSaveDraft}
                    disabled={!title.trim() || saving}
                    className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
                >
                    {t('saveDraft')}
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={!isValid || saving}
                    className="px-8 py-3 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
                >
                    {saving ? '...' : t('generateAgreement')}
                </button>
            </div>
        </div>
    );
}
