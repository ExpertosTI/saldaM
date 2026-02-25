'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, API_BASE_URL } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';
import ConfirmDialog from '@/components/ConfirmDialog';
import Modal from '@/components/Modal';

interface Contact {
    id: string;
    name: string | null;
    email: string;
    phone?: string;
    ipiNumber?: string;
    pro?: string;
    publishingCompany?: string;
    role: 'SONGWRITER' | 'PRODUCER' | 'PUBLISHER' | 'ARTIST' | 'OTHER';
    notes?: string;
    isFavorite: boolean;
    status: 'PENDING' | 'REQUEST_SENT' | 'CONNECTED' | 'BLOCKED';
    linkedUserId?: string | null;
    linkedUserAvatar?: string | null;
    linkedAt?: string | null;
    createdAt: string;
}

interface ContactStats {
    total: number;
    byRole: Record<string, number>;
    byStatus: { pending: number; connected: number; requestSent: number };
    favorites: number;
}

interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

const roleColors: Record<string, string> = {
    SONGWRITER: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PRODUCER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    PUBLISHER: 'bg-green-500/20 text-green-400 border-green-500/30',
    ARTIST: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    OTHER: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const roleLabels: Record<string, string> = {
    SONGWRITER: 'Compositor',
    PRODUCER: 'Productor',
    PUBLISHER: 'Editorial',
    ARTIST: 'Artista',
    OTHER: 'Otro',
};

const roleIcons: Record<string, string> = {
    SONGWRITER: '🎵',
    PRODUCER: '🎛️',
    PUBLISHER: '📋',
    ARTIST: '🎤',
    OTHER: '👤',
};

const statusConfig: Record<string, { label: string; dot: string; bg: string }> = {
    CONNECTED: { label: 'Conectado', dot: 'bg-green-400', bg: 'bg-green-500/15 text-green-400 border-green-500/20' },
    REQUEST_SENT: { label: 'Solicitud enviada', dot: 'bg-blue-400', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    PENDING: { label: 'Pendiente', dot: 'bg-yellow-400', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
    BLOCKED: { label: 'Bloqueado', dot: 'bg-red-400', bg: 'bg-red-500/15 text-red-400 border-red-500/20' },
};

export default function CollaboratorsPage() {
    const { success, error } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [stats, setStats] = useState<ContactStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ emailOrPhone: '', name: '', role: 'OTHER' });
    const [saving, setSaving] = useState(false);

    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [editForm, setEditForm] = useState({
        name: '', email: '', phone: '', ipiNumber: '', pro: '',
        publishingCompany: '', role: 'OTHER', notes: '',
    });

    // Chat Modal
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatContact, setChatContact] = useState<Contact | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);

    // Share Modal
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [shareContactName, setShareContactName] = useState('');

    // Delete
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [contactToDeleteId, setContactToDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchContacts = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);
            const res = await fetch(`${API_BASE_URL}/contacts/mine?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setContacts(await res.json());
        } catch (e) {
            console.error('Error fetching contacts:', e);
        }
    }, [roleFilter, search]);

    const fetchStats = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/contacts/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setStats(await res.json());
        } catch (e) {
            console.error('Error fetching stats:', e);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchContacts(), fetchStats()]);
            setLoading(false);
        };
        load();
    }, [fetchContacts, fetchStats]);

    // ==================== ADD ====================
    const handleSimpleAdd = async () => {
        const token = getToken();
        if (!token || !addForm.emailOrPhone.trim()) return;
        setSaving(true);
        try {
            const isEmail = addForm.emailOrPhone.includes('@');
            const body: Record<string, string> = { role: addForm.role };
            if (isEmail) body.email = addForm.emailOrPhone.trim();
            else body.phone = addForm.emailOrPhone.trim();
            if (addForm.name.trim()) body.name = addForm.name.trim();

            const res = await fetch(`${API_BASE_URL}/contacts`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const result = await res.json();
                setShowAddModal(false);
                setAddForm({ emailOrPhone: '', name: '', role: 'OTHER' });
                await Promise.all([fetchContacts(), fetchStats()]);
                if (result.isExistingUser) {
                    success('🤝 ¡Usuario encontrado! Se envió solicitud de conexión.');
                } else if (isEmail) {
                    success('📧 Contacto agregado. Se envió invitación por email.');
                } else {
                    success('📱 Contacto agregado. Comparte el link para invitarlo.');
                }
            } else {
                const d = await res.json();
                error(d.message || 'Error al agregar.');
            }
        } catch (e) {
            console.error(e);
            error('Error de conexión.');
        } finally {
            setSaving(false);
        }
    };

    // ==================== EDIT ====================
    const handleOpenEdit = (contact: Contact) => {
        setEditingContact(contact);
        setEditForm({
            name: contact.name || '', email: contact.email || '', phone: contact.phone || '',
            ipiNumber: contact.ipiNumber || '', pro: contact.pro || '',
            publishingCompany: contact.publishingCompany || '', role: contact.role || 'OTHER',
            notes: contact.notes || '',
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingContact) return;
        const token = getToken();
        if (!token) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/contacts/${editingContact.id}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                setShowEditModal(false);
                await Promise.all([fetchContacts(), fetchStats()]);
                success('Contacto actualizado.');
            }
        } catch (e) {
            console.error(e);
            error('Error de conexión.');
        } finally {
            setSaving(false);
        }
    };

    // ==================== CHAT ====================
    const handleOpenChat = async (contact: Contact) => {
        if (!contact.linkedUserId || contact.status !== 'CONNECTED') return;
        setChatContact(contact);
        setShowChatModal(true);
        setChatMessages([]);
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/messages/conversation/${contact.linkedUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setChatMessages(await res.json());
        } catch (e) {
            console.error('Error loading chat:', e);
        }
    };

    const handleSendMessage = async () => {
        if (!chatContact?.linkedUserId || !chatInput.trim()) return;
        const token = getToken();
        if (!token) return;
        setSendingMsg(true);
        try {
            const res = await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: chatContact.linkedUserId, content: chatInput.trim() }),
            });
            if (res.ok) {
                const msg = await res.json();
                setChatMessages((prev) => [...prev, msg]);
                setChatInput('');
            }
        } catch (e) {
            console.error('Error sending message:', e);
        } finally {
            setSendingMsg(false);
        }
    };

    // ==================== ACTIONS ====================
    const handleDelete = async () => {
        if (!contactToDeleteId) return;
        setIsDeleting(true);
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/contacts/${contactToDeleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                await Promise.all([fetchContacts(), fetchStats()]);
                success('Contacto eliminado.');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
            setContactToDeleteId(null);
        }
    };

    const handleToggleFavorite = async (id: string) => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/contacts/${id}/favorite`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) await fetchContacts();
        } catch (e) {
            console.error(e);
        }
    };

    const handleInvite = async (contact: Contact) => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/contacts/${contact.id}/invite`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.link) {
                setShareLink(data.link);
                setShareContactName(contact.name || contact.email || contact.phone || '');
                setShowShareModal(true);
                if (data.emailSent) success('📧 Email enviado.');
            } else {
                error(data.message || 'Error.');
            }
        } catch (e) {
            console.error(e);
            error('Error de conexión.');
        }
    };

    const getWhatsAppShareUrl = () => {
        const message = `¡Hola${shareContactName ? ' ' + shareContactName : ''}! 🎶\n\nTe invito a conectarte conmigo en *Saldaña Music*.\n\nÚnete aquí: ${shareLink}`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };

    // ==================== FILTER ====================
    const filteredContacts = contacts.filter((c) => {
        if (statusFilter && c.status !== statusFilter) return false;
        return true;
    });

    // ==================== RENDER ====================
    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-textMain mb-2">Mi Red</h1>
                <p className="text-textMuted text-sm">
                    Gestiona tu red de colaboradores. Agrega colegas con su email o teléfono.
                </p>
            </header>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="glass-panel p-4 rounded-xl">
                        <p className="text-2xl font-bold text-textMain">{stats.total}</p>
                        <p className="text-xs text-textMuted">Total</p>
                    </div>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'CONNECTED' ? '' : 'CONNECTED')}
                        className={`glass-panel p-4 rounded-xl text-left transition-all ${statusFilter === 'CONNECTED' ? 'ring-1 ring-green-500' : ''}`}
                    >
                        <p className="text-2xl font-bold text-green-400">{stats.byStatus.connected}</p>
                        <p className="text-xs text-textMuted">🟢 Conectados</p>
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'REQUEST_SENT' ? '' : 'REQUEST_SENT')}
                        className={`glass-panel p-4 rounded-xl text-left transition-all ${statusFilter === 'REQUEST_SENT' ? 'ring-1 ring-blue-500' : ''}`}
                    >
                        <p className="text-2xl font-bold text-blue-400">{stats.byStatus.requestSent}</p>
                        <p className="text-xs text-textMuted">🔵 Solicitudes</p>
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'PENDING' ? '' : 'PENDING')}
                        className={`glass-panel p-4 rounded-xl text-left transition-all ${statusFilter === 'PENDING' ? 'ring-1 ring-yellow-500' : ''}`}
                    >
                        <p className="text-2xl font-bold text-yellow-400">{stats.byStatus.pending}</p>
                        <p className="text-xs text-textMuted">🟡 Pendientes</p>
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-highlight border border-border rounded-lg text-textMain placeholder-textMuted focus:border-primary outline-none text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2.5 bg-surface-highlight border border-border rounded-lg text-textMain text-sm focus:border-primary outline-none"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Todos los roles</option>
                    {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap flex items-center gap-2"
                >
                    <span className="text-lg">+</span> Agregar Colaborador
                </button>
            </div>

            {/* Contacts Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass-panel p-5 rounded-xl animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-surface-highlight" />
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-surface-highlight rounded mb-2" />
                                    <div className="h-3 w-24 bg-surface-highlight rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="glass-panel p-12 rounded-xl text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <svg className="w-10 h-10 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-textMain mb-2">
                        {search || roleFilter || statusFilter ? 'No hay resultados.' : 'Comienza a construir tu red'}
                    </h3>
                    <p className="text-textMuted text-sm mb-6 max-w-md mx-auto">
                        Agrega con email o teléfono. Cuando se registren, te llegará una solicitud de conexión.
                    </p>
                    {!search && !roleFilter && !statusFilter && (
                        <button onClick={() => setShowAddModal(true)} className="px-8 py-3 bg-primary text-black font-semibold rounded-xl hover:bg-yellow-400 transition-all text-sm">
                            + Agregar mi primer colaborador
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContacts.map((contact) => {
                        const roleKey = roleLabels[contact.role] ? contact.role : 'OTHER';
                        const isConnected = contact.status === 'CONNECTED';
                        const isRequestSent = contact.status === 'REQUEST_SENT';
                        const displayName = contact.name || contact.email || contact.phone || 'Sin nombre';
                        const initial = displayName[0]?.toUpperCase() || '?';
                        const st = statusConfig[contact.status] || statusConfig.PENDING;

                        return (
                            <div key={contact.id} className="glass-panel p-5 rounded-xl hover:border-primary/30 transition-all group relative">
                                {/* Status Badge */}
                                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${st.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                    {st.label}
                                </div>

                                {/* Avatar + Name */}
                                <div className="flex items-center gap-3 mb-3 pr-28">
                                    <div className="relative">
                                        {isConnected && contact.linkedUserAvatar ? (
                                            <img src={contact.linkedUserAvatar} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isConnected ? 'bg-gradient-to-br from-green-500/30 to-green-500/10 text-green-400' : 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary'}`}>
                                                {initial}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-textMain font-semibold truncate">{displayName}</h3>
                                        <p className="text-xs text-textMuted truncate">{contact.email || contact.phone || ''}</p>
                                    </div>
                                </div>

                                {/* Role + PRO (only for connected) */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-xs border ${roleColors[roleKey]}`}>
                                        {roleIcons[roleKey]} {roleLabels[roleKey] || 'Otro'}
                                    </span>
                                    {isConnected && contact.pro && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-surface-highlight text-textMuted">{contact.pro}</span>
                                    )}
                                    {isConnected && contact.ipiNumber && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-surface-highlight text-textMuted">IPI: {contact.ipiNumber}</span>
                                    )}
                                </div>

                                {/* Favorite */}
                                <button
                                    onClick={() => handleToggleFavorite(contact.id)}
                                    className={`absolute top-10 right-3 text-lg transition-colors ${contact.isFavorite ? 'text-primary' : 'text-gray-600 hover:text-primary opacity-0 group-hover:opacity-100'}`}
                                >
                                    {contact.isFavorite ? '★' : '☆'}
                                </button>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-white/5 mt-2">
                                    {isConnected && (
                                        <button
                                            onClick={() => handleOpenChat(contact)}
                                            className="flex-1 px-3 py-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors font-medium"
                                        >
                                            💬 Mensaje
                                        </button>
                                    )}
                                    {isRequestSent && (
                                        <span className="flex-1 px-3 py-1.5 text-xs bg-blue-500/10 rounded-lg text-blue-400 font-medium text-center">
                                            ⏳ Esperando aceptación
                                        </span>
                                    )}
                                    {contact.status === 'PENDING' && contact.email && (
                                        <button
                                            onClick={() => handleInvite(contact)}
                                            className="flex-1 px-3 py-1.5 text-xs bg-yellow-500/15 hover:bg-yellow-500/25 rounded-lg text-yellow-400 transition-colors font-medium"
                                        >
                                            📧 Invitar
                                        </button>
                                    )}
                                    <button onClick={() => handleOpenEdit(contact)} className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-textMuted hover:text-textMain transition-colors">✏️</button>
                                    <button onClick={() => { setContactToDeleteId(contact.id); setShowDeleteConfirm(true); }} className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors">🗑️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ==================== ADD MODAL ==================== */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Agregar Colaborador">
                <div className="space-y-5">
                    <p className="text-sm text-gray-400">
                        Si el email ya tiene cuenta, se enviará una solicitud de conexión. Si no, se enviará una invitación.
                    </p>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Email o Teléfono *</label>
                        <input
                            type="text" placeholder="ejemplo@email.com o +1 809 555 1234"
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:border-primary outline-none placeholder-gray-600 text-base"
                            value={addForm.emailOrPhone}
                            onChange={(e) => setAddForm({ ...addForm, emailOrPhone: e.target.value })}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSimpleAdd()}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Nombre (opcional)</label>
                        <input
                            type="text" placeholder="¿Cómo se llama?"
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:border-primary outline-none placeholder-gray-600"
                            value={addForm.name}
                            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Rol</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['SONGWRITER', 'PRODUCER', 'PUBLISHER', 'ARTIST', 'OTHER'] as const).map((r) => (
                                <button
                                    key={r} type="button"
                                    onClick={() => setAddForm({ ...addForm, role: r })}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${addForm.role === r ? roleColors[r] : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    {roleIcons[r]} {roleLabels[r]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-xl border border-neutral-700">Cancelar</button>
                        <button type="button" onClick={handleSimpleAdd} disabled={saving || !addForm.emailOrPhone.trim()} className="flex-1 px-6 py-3 bg-primary text-black font-semibold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50">
                            {saving ? 'Agregando...' : '+ Agregar'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ==================== EDIT MODAL ==================== */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Contacto">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                        <input type="text" className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                            <input type="tel" className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Rol</label>
                        <select className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                            {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">PRO</label>
                            <input type="text" placeholder="ASCAP, BMI..." className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none placeholder-gray-600" value={editForm.pro} onChange={(e) => setEditForm({ ...editForm, pro: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">CAE/IPI</label>
                            <input type="text" placeholder="IPI" className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none placeholder-gray-600" value={editForm.ipiNumber} onChange={(e) => setEditForm({ ...editForm, ipiNumber: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Notas</label>
                        <textarea rows={2} className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none resize-none" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                    </div>
                    <div className="pt-3 flex gap-3 justify-end">
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                        <button type="button" onClick={handleSaveEdit} disabled={saving} className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ==================== CHAT MODAL ==================== */}
            <Modal isOpen={showChatModal} onClose={() => setShowChatModal(false)} title={`💬 ${chatContact?.name || 'Chat'}`}>
                <div className="flex flex-col h-[400px]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                        {chatMessages.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 text-sm">Envía el primer mensaje 👋</p>
                            </div>
                        ) : (
                            chatMessages.map((msg) => {
                                const isMine = msg.senderId !== chatContact?.linkedUserId;
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
                    {/* Input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Escribe un mensaje..."
                            className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:border-primary outline-none text-sm"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={sendingMsg || !chatInput.trim()}
                            className="px-4 py-2.5 bg-primary text-black font-semibold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ==================== SHARE MODAL ==================== */}
            <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Compartir Invitación">
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Comparte con <strong className="text-white">{shareContactName}</strong>.</p>
                    <a href={getWhatsAppShareUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full px-5 py-4 bg-green-600/15 hover:bg-green-600/25 border border-green-600/30 rounded-xl text-green-400 font-medium transition-all">
                        <span className="text-2xl">💬</span>
                        <div>
                            <p className="font-semibold text-green-300">Enviar por WhatsApp</p>
                            <p className="text-xs text-green-400/60">Se abrirá WhatsApp con el mensaje listo</p>
                        </div>
                    </a>
                    <button
                        onClick={() => { navigator.clipboard.writeText(`Únete a mi red en Saldaña Music: ${shareLink}`); success('📋 Link copiado'); }}
                        className="flex items-center gap-3 w-full px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-textMain transition-all"
                    >
                        <span className="text-2xl">📋</span>
                        <div className="text-left">
                            <p className="font-semibold">Copiar link</p>
                            <p className="text-xs text-textMuted">Copiar al portapapeles</p>
                        </div>
                    </button>
                    <div className="px-4 py-3 bg-neutral-900 rounded-lg border border-neutral-800">
                        <p className="text-[11px] text-gray-500 mb-1">LINK</p>
                        <p className="text-xs text-gray-400 break-all">{shareLink}</p>
                    </div>
                    <button onClick={() => setShowShareModal(false)} className="w-full mt-2 px-6 py-3 text-gray-400 hover:text-white rounded-xl border border-neutral-700">Cerrar</button>
                </div>
            </Modal>

            {/* ==================== DELETE CONFIRM ==================== */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Eliminar Colaborador"
                message="¿Estás seguro? Esta acción no se puede deshacer."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
}
