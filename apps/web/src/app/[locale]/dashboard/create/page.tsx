"use client";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { API_BASE_URL, getToken } from '@/lib/auth';

type Role = "Songwriter" | "Producer";

type Collaborator = {
    name: string;
    role: Role;
    percentage: number;
};

export default function CreateSplitSheet() {
    const t = useTranslations();
    const [title, setTitle] = useState("");
    const [collaborators, setCollaborators] = useState<Collaborator[]>([
        { name: "My User (Owner)", role: "Songwriter", percentage: 50 },
    ]);
    const [message, setMessage] = useState<string>('');

    const addCollaborator = () => {
        setCollaborators([...collaborators, { name: "", role: "Songwriter", percentage: 0 }]);
    };

    const updateCollaborator = (index: number, field: keyof Collaborator, value: any) => {
        const newCollabs = [...collaborators];
        // @ts-ignore
        newCollabs[index][field] = value;
        setCollaborators(newCollabs);
    };

    const totalPercentage = collaborators.reduce((sum, c) => sum + Number(c.percentage), 0);
    const isValid = totalPercentage === 100;

    const handleGenerate = async () => {
        try {
            setMessage('');
            const token = getToken();
            if (!token) {
                setMessage(t('System.pleaseLogin'));
                return;
            }

            const res = await fetch(`${API_BASE_URL}/split-sheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    collaborators,
                    status: 'DRAFT'
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessage(t('System.splitSheetCreated'));
            } else {
                setMessage(t('System.splitSheetCreateFailed'));
            }
        } catch (error) {
            console.error(error);
            setMessage(t('System.genericError'));
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Create New Split Sheet</h1>

            <div className="glass-panel p-8 rounded-2xl mb-8">
                <label className="block text-gray-400 text-sm mb-2">Song Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-gray-700 text-2xl font-bold text-white focus:border-primary outline-none py-2 transition-colors placeholder-gray-700"
                    placeholder="Enter Song Title..."
                />
            </div>

            <div className="space-y-4 mb-8">
                <h2 className="text-xl font-bold text-white flex justify-between">
                    Collaborators
                    <span className={`text-sm py-1 px-3 rounded-full ${isValid ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                        Total: {totalPercentage}%
                    </span>
                </h2>

                {collaborators.map((c, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl flex gap-4 items-center">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Collaborator Name/Email"
                                className="w-full bg-neutral-900/50 border border-neutral-700 rounded p-2 text-white focus:border-primary outline-none"
                                value={c.name}
                                onChange={(e) => updateCollaborator(i, 'name', e.target.value)}
                            />
                        </div>
                        <select
                            className="bg-neutral-900/50 border border-neutral-700 rounded p-2 text-white outline-none"
                            value={c.role}
                            onChange={(e) => updateCollaborator(i, 'role', e.target.value)}
                        >
                            <option>Songwriter</option>
                            <option>Producer</option>
                        </select>
                        <div className="w-24 relative">
                            <input
                                type="number"
                                className="w-full bg-neutral-900/50 border border-neutral-700 rounded p-2 text-white focus:border-primary outline-none text-right pr-6"
                                value={c.percentage}
                                onChange={(e) => updateCollaborator(i, 'percentage', parseFloat(e.target.value))}
                            />
                            <span className="absolute right-2 top-2 text-gray-500">%</span>
                        </div>
                    </div>
                ))}

                <button onClick={addCollaborator} className="text-primary hover:text-white text-sm font-semibold">
                    + Add Collaborator
                </button>
            </div>

            <div className="flex justify-end gap-4">
                <button className="px-6 py-3 text-gray-400 hover:text-white">Save Draft</button>
                <button onClick={handleGenerate} disabled={!isValid || !title} className="px-8 py-3 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                    Generate Agreement
                </button>
            </div>

            {message && (
                <div className="mt-4 text-sm font-semibold text-gray-300">{message}</div>
            )}
        </div>
    );
}
