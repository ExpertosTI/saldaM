'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getToken, removeToken, API_BASE_URL } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/ConfirmDialog';

interface UserData {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userType: string | null;
    proAffiliation: string | null;
    createdAt: string;
}

interface NotificationSettings {
    emailSignatures: boolean;
    emailRoyalties: boolean;
    emailMarketing: boolean;
    pushNotifications: boolean;
}

export default function SettingsPage() {
    const t = useTranslations('Settings');
    const tCommon = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();

    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailSignatures: true,
        emailRoyalties: true,
        emailMarketing: false,
        pushNotifications: true
    });

    const [theme, setTheme] = useState('dark');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
                    const data = await res.json();
                    setUser(data);
                }
            } catch (e) {
                console.error('Failed to fetch user', e);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [locale, router]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        // Simulate save - in production this would call the API
        await new Promise(r => setTimeout(r, 800));

        setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
        setSaving(false);
    };

    const handleExportData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            // Fetch all user data
            const res = await fetch(`${API_BASE_URL}/users/me/export`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `saldana_music_data_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch {
            setMessage({ type: 'error', text: 'Error al exportar datos.' });
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                removeToken();
                router.push(`/${locale}/`);
            }
        } catch {
            setMessage({ type: 'error', text: 'Error al eliminar cuenta.' });
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleLogout = () => {
        removeToken();
        document.cookie = 'token=; path=/; max-age=0';
        sessionStorage.clear();
        window.location.href = `/${locale}/login`;
    };

    const handleLogoutAll = async () => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/auth/logout-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch { }

        handleLogout();
    };

    const toggleNotification = (key: keyof NotificationSettings) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto page-transition">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Configuración</h1>
                <p className="text-gray-400 text-sm">Administra tu cuenta y preferencias.</p>
            </header>

            {message && (
                <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Account Info */}
                <section className="glass-panel p-5 sm:p-6 rounded-xl">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Información de Cuenta
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400">Email</span>
                            <span className="text-white">{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-gray-400">Tipo de Usuario</span>
                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">{user?.userType || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400">Miembro desde</span>
                            <span className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section className="glass-panel p-5 sm:p-6 rounded-xl">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notificaciones
                    </h2>
                    <div className="space-y-4">
                        {[
                            { key: 'emailSignatures' as const, label: 'Alertas de nuevas firmas', desc: 'Recibe un email cuando alguien firma un Split Sheet' },
                            { key: 'emailRoyalties' as const, label: 'Reportes de regalías', desc: 'Resumen semanal de tus ganancias' },
                            { key: 'emailMarketing' as const, label: 'Actualizaciones y noticias', desc: 'Nuevas funciones y tips' },
                            { key: 'pushNotifications' as const, label: 'Notificaciones push', desc: 'Alertas en tiempo real (próximamente)' },
                        ].map(item => (
                            <label key={item.key} className="flex items-start gap-4 cursor-pointer group">
                                <button
                                    onClick={() => toggleNotification(item.key)}
                                    className={`mt-0.5 w-11 h-6 rounded-full p-1 transition-colors ${notifications[item.key] ? 'bg-primary' : 'bg-neutral-700'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </button>
                                <div>
                                    <span className="text-white group-hover:text-primary transition-colors">{item.label}</span>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Appearance */}
                <section className="glass-panel p-5 sm:p-6 rounded-xl">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Apariencia
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTheme('dark')}
                            className={`flex-1 p-4 rounded-lg border transition-all ${theme === 'dark'
                                ? 'border-primary bg-primary/10'
                                : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                                }`}
                        >
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-neutral-900 border border-white/20" />
                            <span className="text-sm text-white">Oscuro</span>
                        </button>
                        <button
                            onClick={() => setTheme('light')}
                            className={`flex-1 p-4 rounded-lg border transition-all opacity-50 cursor-not-allowed ${theme === 'light'
                                ? 'border-primary bg-primary/10'
                                : 'border-neutral-700 bg-neutral-800/50'
                                }`}
                            disabled
                        >
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white border border-neutral-300" />
                            <span className="text-sm text-gray-500">Claro (pronto)</span>
                        </button>
                    </div>
                </section>

                {/* Session & Security */}
                <section className="glass-panel p-5 sm:p-6 rounded-xl">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Sesión y Seguridad
                    </h2>
                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors text-white flex items-center justify-between group"
                        >
                            <span>Cerrar sesión en este dispositivo</span>
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                        <button
                            onClick={handleLogoutAll}
                            className="w-full text-left px-4 py-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors text-white flex items-center justify-between group"
                        >
                            <span>Cerrar sesión en todos los dispositivos</span>
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </section>

                {/* Data & Privacy */}
                <section className="glass-panel p-5 sm:p-6 rounded-xl">
                    <h2 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        Datos y Privacidad
                    </h2>
                    <div className="space-y-3">
                        <button
                            onClick={handleExportData}
                            className="w-full text-left px-4 py-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors text-white flex items-center justify-between group"
                        >
                            <div>
                                <span>Exportar mis datos</span>
                                <p className="text-xs text-gray-500">Descarga toda tu información en JSON</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="glass-panel p-5 sm:p-6 rounded-xl border border-red-500/20">
                    <h2 className="text-lg font-bold text-red-400 border-b border-red-500/10 pb-2 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Zona de Peligro
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        Esta acción es permanente e irreversible. Se eliminarán todos tus Split Sheets, colaboradores y datos de cuenta.
                    </p>
                    <div className="flex justify-start">
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-5 py-2.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 font-semibold transition-all"
                        >
                            Eliminar mi cuenta
                        </button>
                    </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end pt-2 pb-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAccount}
                title="Eliminar Cuenta"
                message="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos."
                confirmText="Sí, Eliminar Cuenta"
                cancelText="Cancelar"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
}
