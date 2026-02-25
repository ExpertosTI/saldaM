'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, API_BASE_URL } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl: string | null;
    fromUserId: string | null;
    fromUserName: string | null;
    fromUserAvatar: string | null;
    isRead: boolean;
    createdAt: string;
}

const typeIcons: Record<string, string> = {
    CONNECTION_REQUEST: '🤝',
    CONNECTION_ACCEPTED: '🎉',
    INVITE_SENT: '📩',
    SPLIT_SHEET_INVITE: '📄',
    SYSTEM: '⚙️',
};

export default function NotificationsPage() {
    const { success, error } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error('Error fetching notifications:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string) => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (e) {
            console.error('Error marking as read:', e);
        }
    };

    const handleMarkAllAsRead = async () => {
        const token = getToken();
        if (!token) return;

        try {
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            success('Todas marcadas como leídas');
        } catch (e) {
            console.error('Error marking all as read:', e);
            error('Error al procesar');
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days}d`;
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-textMain">Notificaciones</h1>
                    <p className="text-sm text-textMuted">
                        {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día ✨'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
                    >
                        Marcar todo como leído
                    </button>
                )}
            </header>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface-highlight" />
                                <div className="flex-1">
                                    <div className="h-4 w-48 bg-surface-highlight rounded mb-2" />
                                    <div className="h-3 w-64 bg-surface-highlight rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="glass-panel p-12 rounded-xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                        🔔
                    </div>
                    <h3 className="text-lg font-semibold text-textMain mb-2">Sin notificaciones</h3>
                    <p className="text-textMuted text-sm">
                        Cuando alguien te agregue como colaborador o te invite, verás las notificaciones aquí.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notif) => (
                        <button
                            key={notif.id}
                            onClick={() => {
                                if (!notif.isRead) handleMarkAsRead(notif.id);
                                if (notif.actionUrl) {
                                    window.location.href = notif.actionUrl;
                                }
                            }}
                            className={`w-full text-left glass-panel p-4 rounded-xl transition-all hover:border-primary/20 ${!notif.isRead
                                    ? 'border-l-2 border-l-primary bg-primary/5'
                                    : 'opacity-70'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Avatar or Icon */}
                                <div className="flex-shrink-0">
                                    {notif.fromUserAvatar ? (
                                        <img
                                            src={notif.fromUserAvatar}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                                            {typeIcons[notif.type] || '🔔'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-semibold text-textMain truncate">
                                            {notif.title}
                                        </p>
                                        {!notif.isRead && (
                                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-textMuted line-clamp-2">{notif.message}</p>
                                </div>

                                {/* Time */}
                                <span className="text-[10px] text-gray-500 flex-shrink-0 mt-0.5">
                                    {timeAgo(notif.createdAt)}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
