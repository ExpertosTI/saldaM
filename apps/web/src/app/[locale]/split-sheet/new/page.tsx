"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, FileText } from "lucide-react";

export default function NewSplitSheetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        label: "",
        studio: "",
        producerName: "",
        collaborators: [
            {
                legalName: "",
                email: "",
                role: "SONGWRITER",
                percentage: 50,
                ipi: "",
                proAffiliation: "",
                phone: "",
            },
        ],
    });
    const [contacts, setContacts] = useState<any[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(true);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            // Get token helper ideally, but for now assuming we have a way or just direct fetch if relying on cookie proxy? 
            // Wait, this is client side. We need the token.
            // Let's assume a helper or just localStorage for now as established in other files (getToken()).
            // Accessing localStorage directly for simplicity or importing the helper.
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/contacts/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setContacts(data);
            }
        } catch (e) {
            console.error("Error fetching contacts", e);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleQuickAdd = (contact: any) => {
        // Check if already added
        if (formData.collaborators.some(c => c.email === contact.email)) {
            alert("Este colaborador ya está en la lista.");
            return;
        }

        setFormData({
            ...formData,
            collaborators: [
                ...formData.collaborators,
                {
                    legalName: contact.name,
                    email: contact.email,
                    role: contact.role || "SONGWRITER", // Default or map from contact role
                    percentage: 0,
                    ipi: contact.notes?.includes('IPI:') ? contact.notes.split('IPI:')[1].trim() : "", // Naive parsing or just empty
                    proAffiliation: "", // Add to contact entity later if needed
                    phone: contact.phone || "",
                },
            ],
        });
    };

    // Helper for Avatar Initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const addCollaborator = () => {
        setFormData({
            ...formData,
            collaborators: [
                ...formData.collaborators,
                {
                    legalName: "",
                    email: "",
                    role: "SONGWRITER",
                    percentage: 0,
                    ipi: "",
                    proAffiliation: "",
                    phone: "",
                },
            ],
        });
    };

    const removeCollaborator = (index: number) => {
        const newCollabs = [...formData.collaborators];
        newCollabs.splice(index, 1);
        setFormData({ ...formData, collaborators: newCollabs });
    };

    const updateCollaborator = (index: number, field: string, value: any) => {
        const newCollabs = [...formData.collaborators];
        newCollabs[index] = { ...newCollabs[index], [field]: value } as any;
        setFormData({ ...formData, collaborators: newCollabs });
    };

    // Calculate total percentage
    const totalPercentage = formData.collaborators.reduce((acc, curr) => acc + Number(curr.percentage), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/split-sheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Documento Creado Exitosamente!");
                router.push(`/${window.location.pathname.split('/')[1]}/dashboard`);
            } else {
                alert("Error al guardar. Verifica los datos.");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-yellow-200 to-primary">
                            Nuevo Split Sheet
                        </h1>
                        <p className="text-gray-400 mt-2">Documento de Reparto de Derechos de Autor</p>
                    </div>
                    <FileText className="w-10 h-10 text-primary opacity-50" />
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECTION 1: SONG INFO */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
                        <h2 className="text-xl font-semibold mb-4 text-primary">1. Información de la Obra</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Título de la Canción</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Sello Disquero (Label)</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Estudio de Grabación</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                                    value={formData.studio}
                                    onChange={(e) => setFormData({ ...formData, studio: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Productor General</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/50 border border-neutral-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none transition-colors"
                                    value={formData.producerName}
                                    onChange={(e) => setFormData({ ...formData, producerName: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: COLLABORATORS */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-primary">2. Colaboradores</h2>
                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${totalPercentage === 100 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                Total: {totalPercentage}%
                            </div>
                        </div>

                        {/* Recent Collaborators Quick Select */}
                        {contacts.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recientes / Contactos</h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                                    {contacts.map((contact) => (
                                        <button
                                            key={contact.id}
                                            type="button"
                                            onClick={() => handleQuickAdd(contact)}
                                            className="flex flex-col items-center min-w-[80px] group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 group-hover:border-primary flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-primary transition-all shadow-lg mb-2">
                                                {getInitials(contact.name)}
                                            </div>
                                            <span className="text-xs text-center text-gray-400 group-hover:text-white truncate w-20">{contact.name.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {formData.collaborators.map((collab, index) => (
                                <div key={index} className="relative group bg-black/40 border border-neutral-700/50 rounded-xl p-4 hover:border-primary/30 transition-all">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="md:col-span-2">
                                            <label className="text-xs text-gray-500 block mb-1">Nombre Legal Completo</label>
                                            <input
                                                required
                                                placeholder="Ej. Juan Pérez"
                                                className="w-full bg-transparent border-b border-neutral-700 focus:border-primary focus:outline-none py-1 text-sm"
                                                value={collab.legalName}
                                                onChange={(e) => updateCollaborator(index, 'legalName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Rol</label>
                                            <select
                                                className="w-full bg-neutral-800 border-none rounded text-xs py-1.5 focus:ring-0"
                                                value={collab.role}
                                                onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                                            >
                                                <option value="SONGWRITER">Compositor / Autor</option>
                                                <option value="PRODUCER">Productor</option>
                                                <option value="MASTER_OWNER">Dueño de Máster</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Porcentaje (%)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent border-b border-neutral-700 focus:border-primary focus:outline-none py-1 text-sm font-bold text-center"
                                                value={collab.percentage}
                                                onChange={(e) => updateCollaborator(index, 'percentage', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Email</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full bg-transparent border-b border-neutral-700 focus:border-primary focus:outline-none py-1 text-xs"
                                                value={collab.email}
                                                onChange={(e) => updateCollaborator(index, 'email', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">IPI / CAE</label>
                                            <input
                                                className="w-full bg-transparent border-b border-neutral-700 focus:border-primary focus:outline-none py-1 text-xs"
                                                value={collab.ipi}
                                                onChange={(e) => updateCollaborator(index, 'ipi', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">PRO (ASCAP/BMI)</label>
                                            <input
                                                className="w-full bg-transparent border-b border-neutral-700 focus:border-primary focus:outline-none py-1 text-xs"
                                                value={collab.proAffiliation}
                                                onChange={(e) => updateCollaborator(index, 'proAffiliation', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 block mb-1">Teléfono</label>
                                            <input
                                                className="w-full bg-transparent border-b border-neutral-700 focus:border-primary focus:outline-none py-1 text-xs"
                                                value={collab.phone}
                                                onChange={(e) => updateCollaborator(index, 'phone', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {formData.collaborators.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCollaborator(index)}
                                            className="absolute top-2 right-2 text-red-500/50 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addCollaborator}
                            className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-white transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Colaborador
                        </button>
                    </div>

                    <div className="flex justify-end pt-8">
                        <button
                            type="submit"
                            disabled={loading || totalPercentage !== 100}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all ${loading || totalPercentage !== 100
                                ? 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                                : 'bg-primary text-black hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.4)]'
                                }`}
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Guardando...' : 'Crear Documento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
