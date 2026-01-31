"use client";

import { useState } from "react";
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
            // Note: This logic assumes an API endpoint exists.
            // For MVP, we might mock or ensure the backend is ready.
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://app.saldanamusic.com/api'}/split-sheets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Documento Creado Exitosamente!");
                // Redirect to dashboard or view page
                router.push('/dashboard');
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
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-primary">2. Colaboradores</h2>
                            <div className={`text-sm font-bold px-3 py-1 rounded-full ${totalPercentage === 100 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                Total: {totalPercentage}%
                            </div>
                        </div>

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
