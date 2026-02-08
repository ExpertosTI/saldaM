'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
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

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ... (rest of the file)

    {/* Appearance */ }
    <section className="glass-panel p-5 sm:p-6 rounded-xl">
        <h2 className="text-lg font-bold text-textMain border-b border-border pb-2 mb-4 flex items-center gap-2">
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
                    : 'border-border bg-surface-highlight hover:border-textMuted'
                    }`}
            >
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-neutral-900 border border-white/20" />
                <span className="text-sm text-textMain">Oscuro</span>
            </button>
            <button
                onClick={() => setTheme('light')}
                className={`flex-1 p-4 rounded-lg border transition-all ${theme === 'light'
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface-highlight hover:border-textMuted'
                    }`}
            >
                <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white border border-neutral-300" />
                <span className="text-sm text-textMain">Claro</span>
            </button>
        </div>
    </section>

    {/* Session & Security */ }
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

    {/* Data & Privacy */ }
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

    {/* Danger Zone */ }
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

    {/* Save Button */ }
    <div className="flex justify-end pt-2 pb-8">
        <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
        >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
    </div>
            </div >

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
        </div >
    );
}
