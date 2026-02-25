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

interface PendingRequest {
    id: string;
    fromUser: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        userType: string | null;
    };
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
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (e) {
            console.error('Error fetching notifications:', e);
        }
    }, []);

    const fetchPendingRequests = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/contacts/pending-requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setPendingRequests(await res.json());
            }
        } catch (e) {
            console.error('Error fetching pending requests:', e);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchNotifications(), fetchPendingRequests()]);
            setLoading(false);
        };
        load();
    }, [fetchNotifications, fetchPendingRequests]);

    const handleAccept = async (requestId: string) => {
        const token = getToken();
        if (!token) return;
        setProcessingId(requestId);

        try {
            const res = await fetch(`${API_BASE_URL}/contacts/${requestId}/accept`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                success('🎉 ¡Conexión aceptada! Ya pueden colaborar.');
                setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
                await fetchNotifications();
            } else {
                const data = await res.json();
                error(data.message || 'Error al aceptar.');
            }
        } catch (e) {
            console.error('Error accepting:', e);
            error('Error de conexión.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId: string) => {
        const token = getToken();
        if (!token) return;
        setProcessingId(requestId);

        try {
            const res = await fetch(`${API_BASE_URL}/contacts/${requestId}/reject`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                success('Solicitud rechazada.');
                setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
            } else {
                const data = await res.json();
                error(data.message || 'Error al rechazar.');
            }
        } catch (e) {
            console.error('Error rejecting:', e);
            error('Error de conexión.');
        } finally {
            setProcessingId(null);
        }
    };

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
            console.error('Error:', e);
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days}d`;
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-textMain">Notificaciones</h1>
                <p className="text-sm text-textMuted">
                    {pendingRequests.length > 0
                        ? `${pendingRequests.length} solicitudes pendientes`
                        : unreadCount > 0
                            ? `${unreadCount} sin leer`
                            : 'Todo al día ✨'}
                </p>
            </header>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-full bg-surface-highlight" />
                                <div className="flex-1">
                                    <div className="h-4 w-48 bg-surface-highlight rounded mb-2" />
                                    <div className="h-3 w-64 bg-surface-highlight rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* ==================== PENDING REQUESTS ==================== */}
                    {pendingRequests.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 px-1">
                                🤝 Solicitudes de Conexión ({pendingRequests.length})
                            </h2>
                            <div className="space-y-3">
                                {pendingRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="glass-panel p-5 rounded-xl border-l-2 border-l-primary"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            {req.fromUser.avatar ? (
                                                <img
                                                    src={req.fromUser.avatar}
                                                    alt=""
                                                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                                    {req.fromUser.name[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-semibold text-textMain">
                                                    {req.fromUser.name}
                                                </p>
                                                <p className="text-xs text-textMuted truncate">
                                                    {req.fromUser.email}
                                                </p>
                                                {req.fromUser.userType && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded">
                                                        {req.fromUser.userType}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Time */}
                                            <span className="text-xs text-gray-500 self-start">
                                                {timeAgo(req.createdAt)}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => handleAccept(req.id)}
                                                disabled={processingId === req.id}
                                                className="flex-1 px-4 py-2.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-semibold rounded-xl transition-all text-sm disabled:opacity-50"
                                            >
                                                {processingId === req.id ? '...' : '✅ Aceptar'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                disabled={processingId === req.id}
                                                className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-xl transition-all text-sm disabled:opacity-50"
                                            >
                                                {processingId === req.id ? '...' : '❌ Rechazar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ==================== NOTIFICATIONS ==================== */}
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider px-1">
                            Actividad Reciente
                        </h2>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-primary hover:text-yellow-300 transition-colors"
                            >
                                Marcar todo como leído
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="glass-panel p-12 rounded-xl text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                                🔔
                            </div>
                            <h3 className="text-lg font-semibold text-textMain mb-2">Sin notificaciones</h3>
                            <p className="text-textMuted text-sm">
                                Cuando alguien te agregue como colaborador, verás las notificaciones aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => {
                                        if (!notif.isRead) handleMarkAsRead(notif.id);
                                    }}
                                    className={`w-full text-left glass-panel p-4 rounded-xl transition-all hover:border-primary/20 ${!notif.isRead
                                        ? 'border-l-2 border-l-primary bg-primary/5'
                                        : 'opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
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
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-semibold text-textMain truncate">
                                                    {notif.title}
                                                </p>
                                                {!notif.isRead && (
                                                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-textMuted">{notif.message}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                                            {timeAgo(notif.createdAt)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
