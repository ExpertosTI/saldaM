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
    status: 'PENDING' | 'CONNECTED' | 'BLOCKED';
    linkedUserId?: string | null;
    linkedUserAvatar?: string | null;
    linkedAt?: string | null;
    createdAt: string;
}

interface ContactStats {
    total: number;
    byRole: {
        songwriter: number;
        producer: number;
        publisher: number;
        artist: number;
        other: number;
    };
    byStatus: {
        pending: number;
        connected: number;
    };
    favorites: number;
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

export default function CollaboratorsPage() {
    const { success, error } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [stats, setStats] = useState<ContactStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    // Simple Add Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ emailOrPhone: '', name: '', role: 'OTHER' });
    const [saving, setSaving] = useState(false);

    // Edit Modal (full form)
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        ipiNumber: '',
        pro: '',
        publishingCompany: '',
        role: 'OTHER',
        notes: '',
    });

    // Confirm Dialog
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
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            } else {
                error('Error al cargar contactos.');
            }
        } catch (e) {
            console.error('Error fetching contacts:', e);
            error('Error de conexión al cargar contactos.');
        }
    }, [error, roleFilter, search]);

    const fetchStats = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/contacts/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            } else {
                error('Error al cargar estadísticas.');
            }
        } catch (e) {
            console.error('Error fetching stats:', e);
            error('Error de conexión al cargar estadísticas.');
        }
    }, [error]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchContacts(), fetchStats()]);
            setLoading(false);
        };
        load();
    }, [fetchContacts, fetchStats]);

    // ==================== SIMPLE ADD ====================
    const handleSimpleAdd = async () => {
        const token = getToken();
        if (!token) return;
        if (!addForm.emailOrPhone.trim()) {
            error('Ingresa un email o número de teléfono.');
            return;
        }

        setSaving(true);
        try {
            const isEmail = addForm.emailOrPhone.includes('@');
            const body: Record<string, string> = {
                role: addForm.role,
            };
            if (isEmail) {
                body.email = addForm.emailOrPhone.trim();
            } else {
                body.phone = addForm.emailOrPhone.trim();
            }
            if (addForm.name.trim()) {
                body.name = addForm.name.trim();
            }

            const res = await fetch(`${API_BASE_URL}/contacts`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setShowAddModal(false);
                setAddForm({ emailOrPhone: '', name: '', role: 'OTHER' });
                await Promise.all([fetchContacts(), fetchStats()]);
                success(isEmail
                    ? '¡Contacto agregado! Se envió una invitación por email. 📧'
                    : '¡Contacto agregado exitosamente! 📱');
            } else {
                const errorData = await res.json();
                error(errorData.message || 'Error al agregar colaborador.');
            }
        } catch (e) {
            console.error('Error adding contact:', e);
            error('Error de conexión.');
        } finally {
            setSaving(false);
        }
    };

    // ==================== EDIT ====================
    const handleOpenEdit = (contact: Contact) => {
        setEditingContact(contact);
        setEditForm({
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            ipiNumber: contact.ipiNumber || '',
            pro: contact.pro || '',
            publishingCompany: contact.publishingCompany || '',
            role: contact.role || 'OTHER',
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
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (res.ok) {
                setShowEditModal(false);
                await Promise.all([fetchContacts(), fetchStats()]);
                success('Contacto actualizado.');
            } else {
                const errorData = await res.json();
                error(errorData.message || 'Error al guardar.');
            }
        } catch (e) {
            console.error('Error saving contact:', e);
            error('Error de conexión.');
        } finally {
            setSaving(false);
        }
    };

    // ==================== ACTIONS ====================
    const confirmDelete = (id: string) => {
        setContactToDeleteId(id);
        setShowDeleteConfirm(true);
    };

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
            } else {
                const errorData = await res.json();
                error(errorData.message || 'Error al eliminar.');
            }
        } catch (e) {
            console.error('Error deleting contact:', e);
            error('Error de conexión.');
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
            if (res.ok) {
                await fetchContacts();
            } else {
                error('Error al actualizar favorito.');
            }
        } catch (e) {
            console.error('Error toggling favorite:', e);
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
            if (res.ok) {
                if (data.link) {
                    navigator.clipboard.writeText(
                        `¡Hola${contact.name ? ' ' + contact.name : ''}! Te invito a conectarte conmigo en Saldaña Music.\n\nÚnete aquí: ${data.link}`
                    );
                    success('Invitación enviada y link copiado al portapapeles 📋');
                } else {
                    success('Invitación enviada.');
                }
            } else {
                error(data.message || 'Error al enviar invitación.');
            }
        } catch (e) {
            console.error('Error sending invite:', e);
            error('Error de conexión.');
        }
    };

    // ==================== FILTER ====================
    const filteredContacts = contacts.filter((c) => {
        if (statusFilter === 'CONNECTED' && c.status !== 'CONNECTED') return false;
        if (statusFilter === 'PENDING' && c.status !== 'PENDING') return false;
        return true;
    });

    // ==================== RENDER ====================
    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-textMain mb-2">Mi Red</h1>
                <p className="text-textMuted text-sm sm:text-base">
                    Gestiona tu red de colaboradores musicales. Agrega colegas con solo su email o teléfono.
                </p>
            </header>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="glass-panel p-4 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-textMain">{stats.total}</p>
                        <p className="text-xs text-textMuted">Total</p>
                    </div>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'CONNECTED' ? '' : 'CONNECTED')}
                        className={`glass-panel p-4 rounded-xl text-left transition-all ${statusFilter === 'CONNECTED' ? 'ring-1 ring-green-500' : ''}`}
                    >
                        <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats.byStatus?.connected ?? 0}</p>
                        <p className="text-xs text-textMuted">🟢 Conectados</p>
                    </button>
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'PENDING' ? '' : 'PENDING')}
                        className={`glass-panel p-4 rounded-xl text-left transition-all ${statusFilter === 'PENDING' ? 'ring-1 ring-yellow-500' : ''}`}
                    >
                        <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{stats.byStatus?.pending ?? 0}</p>
                        <p className="text-xs text-textMuted">🟡 Pendientes</p>
                    </button>
                    <div className="glass-panel p-4 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.favorites}</p>
                        <p className="text-xs text-textMuted">★ Favoritos</p>
                    </div>
                </div>
            )}

            {/* Filters & Actions */}
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
                    <option value="SONGWRITER">Compositor</option>
                    <option value="PRODUCER">Productor</option>
                    <option value="PUBLISHER">Editorial</option>
                    <option value="ARTIST">Artista</option>
                    <option value="OTHER">Otro</option>
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
                        {search || roleFilter || statusFilter
                            ? 'No se encontraron contactos con esos filtros.'
                            : 'Comienza a construir tu red'}
                    </h3>
                    <p className="text-textMuted text-sm mb-6 max-w-md mx-auto">
                        Agrega colaboradores con solo su email o teléfono. Cuando se registren en la plataforma, sus datos se vincularán automáticamente.
                    </p>
                    {!search && !roleFilter && !statusFilter && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-8 py-3 bg-primary text-black font-semibold rounded-xl hover:bg-yellow-400 transition-all text-sm shadow-lg shadow-primary/20"
                        >
                            + Agregar mi primer colaborador
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContacts.map((contact) => {
                        const roleKey = (contact.role && roleLabels[contact.role]) ? contact.role : 'OTHER';
                        const isConnected = contact.status === 'CONNECTED';
                        const displayName = contact.name || contact.email || contact.phone || 'Sin nombre';
                        const initial = displayName[0]?.toUpperCase() || '?';

                        return (
                            <div
                                key={contact.id}
                                className="glass-panel p-5 rounded-xl hover:border-primary/30 transition-all group relative"
                            >
                                {/* Connection Status Badge */}
                                <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${isConnected
                                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                    : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
                                    {isConnected ? 'Conectado' : 'Pendiente'}
                                </div>

                                {/* Avatar + Name */}
                                <div className="flex items-center gap-3 mb-3 pr-20">
                                    <div className="relative">
                                        {contact.linkedUserAvatar ? (
                                            <img
                                                src={contact.linkedUserAvatar}
                                                alt={displayName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isConnected
                                                ? 'bg-gradient-to-br from-green-500/30 to-green-500/10 text-green-400'
                                                : 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary'
                                                }`}>
                                                {initial}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-textMain font-semibold truncate">{displayName}</h3>
                                        <p className="text-xs text-textMuted truncate">
                                            {contact.email || contact.phone || ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Role + PRO */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-xs border ${roleColors[roleKey] || roleColors['OTHER']}`}>
                                        {roleIcons[roleKey]} {roleLabels[roleKey] || 'Otro'}
                                    </span>
                                    {contact.pro && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-surface-highlight text-textMuted">
                                            {contact.pro}
                                        </span>
                                    )}
                                    {contact.ipiNumber && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-surface-highlight text-textMuted">
                                            IPI: {contact.ipiNumber}
                                        </span>
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
                                    {!isConnected && contact.email && (
                                        <button
                                            onClick={() => handleInvite(contact)}
                                            className="flex-1 px-3 py-1.5 text-xs bg-yellow-500/15 hover:bg-yellow-500/25 rounded-lg text-yellow-400 transition-colors font-medium"
                                        >
                                            📧 Re-invitar
                                        </button>
                                    )}
                                    {isConnected && (
                                        <button
                                            className="flex-1 px-3 py-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors font-medium cursor-not-allowed opacity-60"
                                            title="Mensajería próximamente"
                                        >
                                            💬 Mensaje
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleOpenEdit(contact)}
                                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-textMuted hover:text-textMain transition-colors"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(contact.id)}
                                        className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ==================== SIMPLE ADD MODAL ==================== */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Agregar Colaborador"
            >
                <div className="space-y-5">
                    <p className="text-sm text-gray-400">
                        Solo necesitas el email o teléfono de tu colaborador. Cuando se registre en Saldaña Music, sus datos se vincularán automáticamente.
                    </p>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Email o Teléfono *</label>
                        <input
                            type="text"
                            placeholder="ejemplo@email.com o +1 809 555 1234"
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
                            type="text"
                            placeholder="¿Cómo se llama?"
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
                                    key={r}
                                    type="button"
                                    onClick={() => setAddForm({ ...addForm, role: r })}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${addForm.role === r
                                        ? `${roleColors[r]} border-opacity-100`
                                        : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:border-gray-500'
                                        }`}
                                >
                                    {roleIcons[r]} {roleLabels[r]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 px-6 py-3 text-gray-400 hover:text-white transition-colors rounded-xl border border-neutral-700 hover:border-neutral-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSimpleAdd}
                            disabled={saving || !addForm.emailOrPhone.trim()}
                            className="flex-1 px-6 py-3 bg-primary text-black font-semibold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Agregando...' : '+ Agregar'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ==================== EDIT MODAL ==================== */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Editar Contacto"
            >
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Rol</label>
                        <select
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        >
                            <option value="SONGWRITER">Compositor</option>
                            <option value="PRODUCER">Productor</option>
                            <option value="PUBLISHER">Editorial</option>
                            <option value="ARTIST">Artista</option>
                            <option value="OTHER">Otro</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">PRO (Sociedad)</label>
                            <input
                                type="text"
                                placeholder="ASCAP, BMI, SGACEDOM..."
                                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none placeholder-gray-600"
                                value={editForm.pro}
                                onChange={(e) => setEditForm({ ...editForm, pro: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">CAE/IPI</label>
                            <input
                                type="text"
                                placeholder="Número IPI"
                                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none placeholder-gray-600"
                                value={editForm.ipiNumber}
                                onChange={(e) => setEditForm({ ...editForm, ipiNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Editorial / Publishing</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                            value={editForm.publishingCompany}
                            onChange={(e) => setEditForm({ ...editForm, publishingCompany: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Notas</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none resize-none"
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ==================== DELETE CONFIRM ==================== */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Eliminar Colaborador"
                message="¿Estás seguro de que deseas eliminar este colaborador? Esta acción no se puede deshacer."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
}
