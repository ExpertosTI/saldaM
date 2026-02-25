'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, API_BASE_URL } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

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

interface InboxItem {
    partnerId: string;
    partnerName: string;
    partnerEmail: string | null;
    partnerAvatar: string | null;
    lastMessage: {
        id: string;
        senderId: string;
        receiverId: string;
        content: string;
        isRead: boolean;
        createdAt: string;
    };
    unreadCount: number;
}

interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
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
    const router = useRouter();
    const locale = useLocale();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [inbox, setInbox] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Chat
    const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | null>(null);
    const [activeChatPartnerName, setActiveChatPartnerName] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);

    // Tab
    const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');

    const fetchNotifications = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setNotifications(await res.json());
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
            if (res.ok) setPendingRequests(await res.json());
        } catch (e) {
            console.error('Error fetching pending requests:', e);
        }
    }, []);

    const fetchInbox = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/messages/inbox`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setInbox(await res.json());
        } catch (e) {
            console.error('Error fetching inbox:', e);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchNotifications(), fetchPendingRequests(), fetchInbox()]);
            setLoading(false);
        };
        load();
    }, [fetchNotifications, fetchPendingRequests, fetchInbox]);

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
                error(data.message || 'Error.');
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
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
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

    // Chat Functions
    const openChat = async (partnerId: string, partnerName: string) => {
        setActiveChatPartnerId(partnerId);
        setActiveChatPartnerName(partnerName);
        setChatMessages([]);
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversation/${partnerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setChatMessages(await res.json());
                await fetchInbox(); // Refresh unread counts
            }
        } catch (e) {
            console.error('Error loading chat:', e);
        }
    };

    const sendMessage = async () => {
        if (!activeChatPartnerId || !chatInput.trim()) return;
        const token = getToken();
        if (!token) return;
        setSendingMsg(true);
        try {
            const res = await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: activeChatPartnerId, content: chatInput.trim() }),
            });
            if (res.ok) {
                const msg = await res.json();
                setChatMessages((prev) => [...prev, msg]);
                setChatInput('');
                await fetchInbox();
            }
        } catch (e) {
            console.error('Error sending:', e);
        } finally {
            setSendingMsg(false);
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const totalUnreadMessages = inbox.reduce((sum, i) => sum + i.unreadCount, 0);

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-textMain">Notificaciones</h1>
                <p className="text-sm text-textMuted">
                    {pendingRequests.length > 0
                        ? `${pendingRequests.length} solicitudes pendientes`
                        : unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día ✨'}
                </p>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-surface-highlight rounded-xl p-1">
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'notifications' ? 'bg-primary text-black' : 'text-textMuted hover:text-textMain'}`}
                >
                    🔔 Notificaciones {unreadCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'messages' ? 'bg-primary text-black' : 'text-textMuted hover:text-textMain'}`}
                >
                    💬 Mensajes {totalUnreadMessages > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{totalUnreadMessages}</span>
                    )}
                </button>
            </div>

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
            ) : activeTab === 'notifications' ? (
                <>
                    {/* ==================== PENDING REQUESTS ==================== */}
                    {pendingRequests.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 px-1">
                                🤝 Solicitudes de Conexión ({pendingRequests.length})
                            </h2>
                            <div className="space-y-3">
                                {pendingRequests.map((req) => (
                                    <div key={req.id} className="glass-panel p-5 rounded-xl border-l-2 border-l-primary">
                                        <div className="flex items-center gap-4">
                                            {req.fromUser.avatar ? (
                                                <img src={req.fromUser.avatar} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                                    {req.fromUser.name[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-semibold text-textMain">{req.fromUser.name}</p>
                                                <p className="text-xs text-textMuted truncate">{req.fromUser.email}</p>
                                                {req.fromUser.userType && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded">{req.fromUser.userType}</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 self-start">{timeAgo(req.createdAt)}</span>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button onClick={() => handleAccept(req.id)} disabled={processingId === req.id}
                                                className="flex-1 px-4 py-2.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-semibold rounded-xl transition-all text-sm disabled:opacity-50">
                                                {processingId === req.id ? '...' : '✅ Aceptar'}
                                            </button>
                                            <button onClick={() => handleReject(req.id)} disabled={processingId === req.id}
                                                className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-xl transition-all text-sm disabled:opacity-50">
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
                        <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wider px-1">Actividad Reciente</h2>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:text-yellow-300 transition-colors">
                                Marcar todo como leído
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="glass-panel p-12 rounded-xl text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-3xl">🔔</div>
                            <h3 className="text-lg font-semibold text-textMain mb-2">Sin notificaciones</h3>
                            <p className="text-textMuted text-sm">Cuando alguien te agregue como colaborador, verás las notificaciones aquí.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => {
                                        if (!notif.isRead) handleMarkAsRead(notif.id);
                                        // Navigate to action URL for split sheet notifications
                                        if (notif.actionUrl && notif.type === 'SPLIT_SHEET_INVITE') {
                                            router.push(`/${locale}${notif.actionUrl}`);
                                        }
                                    }}
                                    className={`w-full text-left glass-panel p-4 rounded-xl transition-all hover:border-primary/20 ${!notif.isRead ? 'border-l-2 border-l-primary bg-primary/5' : 'opacity-60'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            {notif.fromUserAvatar ? (
                                                <img src={notif.fromUserAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                                                    {typeIcons[notif.type] || '🔔'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-semibold text-textMain truncate">{notif.title}</p>
                                                {!notif.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                                            </div>
                                            <p className="text-xs text-textMuted">{notif.message}</p>
                                            {/* Action buttons for specific notification types */}
                                            {notif.type === 'SPLIT_SHEET_INVITE' && notif.actionUrl && (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg">
                                                        📄 Ver Split Sheet →
                                                    </span>
                                                </div>
                                            )}
                                            {notif.type === 'CONNECTION_REQUEST' && notif.fromUserId && (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg">
                                                        Ver solicitudes arriba ↑
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-500 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* ==================== MESSAGES TAB ==================== */
                <div>
                    {activeChatPartnerId ? (
                        /* Active Chat */
                        <div>
                            <button onClick={() => setActiveChatPartnerId(null)} className="flex items-center gap-2 text-sm text-textMuted hover:text-textMain mb-4 transition-colors">
                                ← Volver al inbox
                            </button>
                            <div className="glass-panel rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-white/5 bg-surface-highlight">
                                    <h3 className="font-semibold text-textMain">💬 {activeChatPartnerName}</h3>
                                </div>
                                <div className="h-[350px] overflow-y-auto p-4 space-y-2">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500 text-sm">Envía el primer mensaje 👋</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg) => {
                                            const isMine = msg.senderId !== activeChatPartnerId;
                                            return (
                                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMine ? 'bg-primary/20 text-primary rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                                                        <p>{msg.content}</p>
                                                        <p className="text-[9px] opacity-50 mt-1">{new Date(msg.createdAt).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <div className="p-3 border-t border-white/5 flex gap-2">
                                    <input
                                        type="text" placeholder="Escribe un mensaje..."
                                        className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:border-primary outline-none text-sm"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    />
                                    <button onClick={sendMessage} disabled={sendingMsg || !chatInput.trim()}
                                        className="px-4 py-2.5 bg-primary text-black font-semibold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50">
                                        ➤
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Inbox */
                        <div>
                            {inbox.length === 0 ? (
                                <div className="glass-panel p-12 rounded-xl text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-3xl">💬</div>
                                    <h3 className="text-lg font-semibold text-textMain mb-2">Sin mensajes</h3>
                                    <p className="text-textMuted text-sm">Cuando te conectes con colaboradores, podrás enviarles mensajes desde aquí.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {inbox.map((item) => (
                                        <button
                                            key={item.partnerId}
                                            onClick={() => openChat(item.partnerId, item.partnerName || item.partnerEmail || item.partnerId)}
                                            className={`w-full text-left glass-panel p-4 rounded-xl transition-all hover:border-primary/20 ${item.unreadCount > 0 ? 'border-l-2 border-l-green-400 bg-green-500/5' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.partnerAvatar ? (
                                                    <img src={item.partnerAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                        {(item.partnerName || '?')[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-textMain truncate">
                                                            {item.partnerName || item.partnerEmail || 'Usuario'}
                                                        </p>
                                                        {item.unreadCount > 0 && (
                                                            <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">{item.unreadCount}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-textMuted truncate">{item.lastMessage.content}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-500">{timeAgo(item.lastMessage.createdAt)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
