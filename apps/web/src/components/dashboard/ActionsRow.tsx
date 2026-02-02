
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getToken, API_BASE_URL } from '@/lib/auth';

export default function ActionsRow({ sheet, currentUserId }: { sheet: any; currentUserId?: string | null }) {
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState<string>('');
    const t = useTranslations();
    // sheetId is in sheet.id

    const notify = (msg: string) => {
        setNotice(msg);
        window.setTimeout(() => setNotice(''), 3500);
    };

    const handleShare = async () => {
        setLoading(true);
        try {
            const token = getToken();

            if (!token) {
                notify(t('System.pleaseLogin'));
                return;
            }

            const res = await fetch(`${API_BASE_URL}/split-sheets/${sheet.id}/invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok && data.url) {
                navigator.clipboard.writeText(data.url);
                notify(t('System.inviteCopied'));
            } else {
                notify(t('System.inviteFailed'));
            }
        } catch (e) {
            notify(t('System.shareError'));
        } finally {
            setLoading(false);
        }
    };

    // Removed original status state and comments
    const [localStatus, setLocalStatus] = useState(sheet.status); // New localStatus state based on sheet prop

    const handleAction = async (action: 'start' | 'sign') => {
        setLoading(true);
        try {
            const token = getToken();

            if (!token) {
                notify(t('System.pleaseLogin'));
                return;
            }

            const endpoint = action === 'start' ? 'start-signatures' : 'sign';
            const res = await fetch(`${API_BASE_URL}/split-sheets/${sheet.id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                notify(data.message || 'Success');
                if (data.status) setLocalStatus(data.status); // Update local status
                if (action === 'start') setLocalStatus('PENDING_SIGNATURES');
            } else {
                notify(data.message || t('System.genericError'));
            }
        } catch (e) {
            notify(t('System.genericError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleShare}
                disabled={loading}
                className="p-2 bg-neutral-800 rounded-full hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
                title="Share / Invite"
            >
                {/* Share Icon */}
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>

            {(localStatus === 'DRAFT' || !localStatus) && (
                <button
                    onClick={() => handleAction('start')}
                    disabled={loading}
                    className="p-2 bg-neutral-800 rounded-full hover:bg-yellow-500/20 hover:text-yellow-500 transition-colors"
                    title="Start Signing Process"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            )}

            {localStatus === 'PENDING_SIGNATURES' && (
                <button
                    onClick={() => handleAction('sign')}
                    disabled={loading}
                    className="p-2 bg-neutral-800 rounded-full hover:bg-blue-500/20 hover:text-blue-500 transition-colors"
                    title="Sign Agreement"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            )}

            <a
                href={`${API_BASE_URL}/split-sheets/${sheet.id}/pdf`}
                target="_blank"
                className="p-2 bg-neutral-800 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                title="Download PDF"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </a>

            {notice && (
                <div className="ml-2 text-xs text-gray-400 max-w-[220px] truncate" title={notice}>
                    {notice}
                </div>
            )}
        </div>
    );
}
