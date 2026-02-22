'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, API_BASE_URL } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';
import ConfirmDialog from '@/components/ConfirmDialog';
import Modal from '@/components/Modal';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    ipiNumber?: string;
    pro?: string;
    publishingCompany?: string;
    role: 'SONGWRITER' | 'PRODUCER' | 'PUBLISHER' | 'ARTIST' | 'OTHER';
    notes?: string;
    isFavorite: boolean;
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

export default function CollaboratorsPage() {
    const { success, error } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [stats, setStats] = useState<ContactStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [showFavorites, setShowFavorites] = useState(false);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        ipiNumber: '',
        pro: '',
        publishingCompany: '',
        role: 'SONGWRITER',
        notes: '',
    });
    const [saving, setSaving] = useState(false);

    // Confirm Dialog State
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
            if (showFavorites) params.append('favorite', 'true');

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
    }, [error, roleFilter, search, showFavorites]);

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

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleOpenModal = (contact?: Contact) => {
        if (contact) {
            setEditingContact(contact);
            setFormData({
                name: contact.name || '',
                email: contact.email || '',
                phone: contact.phone || '',
                ipiNumber: contact.ipiNumber || '',
                pro: contact.pro || '',
                publishingCompany: contact.publishingCompany || '',
                role: contact.role || 'SONGWRITER',
                notes: contact.notes || '',
            });
        } else {
            setEditingContact(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                ipiNumber: '',
                pro: '',
                publishingCompany: '',
                role: 'SONGWRITER',
                notes: '',
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        const token = getToken();
        if (!token) return;

        setSaving(true);
        try {
            const url = editingContact
                ? `${API_BASE_URL}/contacts/${editingContact.id}`
                : `${API_BASE_URL}/contacts`;
            const method = editingContact ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowModal(false);
                await Promise.all([fetchContacts(), fetchStats()]);
                success(editingContact ? 'Contacto actualizado.' : 'Contacto creado exitosamente.');
            } else {
                const errorData = await res.json();
                error(errorData.message || 'Error al guardar el contacto.');
            }
        } catch (e) {
            console.error('Error saving contact:', e);
            error('Error de conexión al guardar el contacto.');
        } finally {
            setSaving(false);
        }
    };

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
                error(errorData.message || 'Error al eliminar el contacto.');
            }
        } catch (e) {
            console.error('Error deleting contact:', e);
            error('Error de conexión al eliminar el contacto.');
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
                success('Favorito actualizado.');
            } else {
                const errorData = await res.json();
                error(errorData.message || 'Error al actualizar favorito.');
            }
        } catch (e) {
            console.error('Error toggling favorite:', e);
            error('Error de conexión al actualizar favorito.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-textMain mb-2">Colaboradores</h1>
                <p className="text-textMuted text-sm sm:text-base">Gestiona tu red de artistas, productores y publishers.</p>
            </header>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="glass-panel p-4 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-textMain">{stats.total}</p>
                        <p className="text-xs text-textMuted">Total Contactos</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.favorites}</p>
                        <p className="text-xs text-textMuted">Favoritos</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-blue-400">{stats.byRole.songwriter}</p>
                        <p className="text-xs text-textMuted">Compositores</p>
                    </div>
                    <div className="glass-panel p-4 rounded-xl">
                        <p className="text-2xl sm:text-3xl font-bold text-purple-400">{stats.byRole.producer}</p>
                        <p className="text-xs text-textMuted">Productores</p>
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
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showFavorites
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-surface-highlight border-border text-textMuted hover:text-textMain'
                        }`}
                >
                    ★ Favoritos
                </button>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap"
                >
                    + Nuevo Contacto
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
            ) : contacts.length === 0 ? (
                <div className="glass-panel p-12 rounded-xl text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-highlight flex items-center justify-center">
                        <svg className="w-8 h-8 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-textMain mb-2">No hay contactos</h3>
                    <p className="text-textMuted text-sm mb-4">
                        {search || roleFilter || showFavorites
                            ? 'No se encontraron contactos con esos filtros.'
                            : 'Comienza agregando tu primer colaborador.'}
                    </p>
                    {!search && !roleFilter && !showFavorites && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm"
                        >
                            + Agregar Contacto
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(contacts) && contacts.map((contact) => {
                        const roleKey = (contact.role && roleLabels[contact.role]) ? contact.role : 'OTHER';
                        return (
                            <div
                                key={contact.id}
                                className="glass-panel p-5 rounded-xl hover:border-primary/30 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {(typeof contact.name === 'string' && contact.name[0]) ? contact.name[0].toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <h3 className="text-textMain font-semibold">{typeof contact.name === 'string' ? contact.name : 'Sin Nombre'}</h3>
                                            <p className="text-xs text-textMuted">{contact.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleFavorite(contact.id)}
                                        className={`text-lg transition-colors ${contact.isFavorite ? 'text-primary' : 'text-gray-600 hover:text-primary'
                                            }`}
                                    >
                                        {contact.isFavorite ? '★' : '☆'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-0.5 rounded text-xs border ${roleColors[roleKey] || roleColors['OTHER']}`}>
                                        {roleLabels[roleKey] || 'Otro'}
                                    </span>
                                    {contact.pro && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-surface-highlight text-textMuted">
                                            {contact.pro}
                                        </span>
                                    )}
                                </div>

                                {contact.ipiNumber && (
                                    <p className="text-xs text-textMuted mb-2">
                                        <span className="text-gray-500">IPI:</span> {contact.ipiNumber}
                                    </p>
                                )}

                                <div className="flex gap-2 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(contact)}
                                        className="flex-1 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded text-textMuted hover:text-textMain transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(contact.id)}
                                        className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}
            >
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Rol</label>
                        <select
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                                value={formData.pro}
                                onChange={(e) => setFormData({ ...formData, pro: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">CAE/IPI</label>
                            <input
                                type="text"
                                placeholder="Número IPI"
                                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none placeholder-gray-600"
                                value={formData.ipiNumber}
                                onChange={(e) => setFormData({ ...formData, ipiNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Editorial / Publishing</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none"
                            value={formData.publishingCompany}
                            onChange={(e) => setFormData({ ...formData, publishingCompany: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Notas</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-primary outline-none resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !formData.name}
                            className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : editingContact ? 'Guardar Cambios' : 'Crear Contacto'}
                        </button>
                    </div>
                </form>
            </Modal>

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
