import React, { useState, useEffect } from 'react';
import { X, AlertCircle, UserPlus } from 'lucide-react';
import { ClassRepository } from '../services/classRepository';
import { Button } from './Button';

interface AssignCRModalProps {
    isOpen: boolean;
    classId: string | null;
    className: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const AssignCRModal: React.FC<AssignCRModalProps> = ({
    isOpen,
    classId,
    className,
    onClose,
    onSuccess,
}) => {
    const [mode, setMode] = useState<'create' | 'assign'>('create');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedCRId, setSelectedCRId] = useState('');
    const [unassignedCRs, setUnassignedCRs] = useState<Array<{ id: string; name: string; email: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUnassignedCRs();
        }
    }, [isOpen]);

    const fetchUnassignedCRs = async () => {
        const crs = await ClassRepository.getUnassignedCRs();
        setUnassignedCRs(crs);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!classId) return;

        setIsLoading(true);

        try {
            let success = false;

            if (mode === 'create') {
                if (!name.trim() || !email.trim() || !password.trim()) {
                    setError('All fields are required');
                    setIsLoading(false);
                    return;
                }

                success = await ClassRepository.createCRForClass(
                    name.trim(),
                    email.trim(),
                    password.trim(),
                    classId
                );
            } else {
                if (!selectedCRId) {
                    setError('Please select a CR');
                    setIsLoading(false);
                    return;
                }

                success = await ClassRepository.assignCRToClass(selectedCRId, classId);
            }

            if (success) {
                setName('');
                setEmail('');
                setPassword('');
                setSelectedCRId('');
                onSuccess();
                onClose();
            } else {
                setError(`Failed to ${mode === 'create' ? 'create' : 'assign'} CR`);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Assign CR</h3>
                            <p className="text-sm text-slate-600">{className}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Mode Selection */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setMode('create')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'create'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Create New CR
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('assign')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'assign'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Assign Existing
                        </button>
                    </div>

                    {mode === 'create' ? (
                        <>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    CR Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    placeholder="Enter CR's full name"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    placeholder="cr@example.com"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">
                                    Initial Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    placeholder="Set initial password"
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Select CR <span className="text-red-500">*</span>
                            </label>
                            {unassignedCRs.length === 0 ? (
                                <p className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg">
                                    No unassigned CRs available. Create a new CR instead.
                                </p>
                            ) : (
                                <select
                                    value={selectedCRId}
                                    onChange={(e) => setSelectedCRId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Choose a CR...</option>
                                    {unassignedCRs.map((cr) => (
                                        <option key={cr.id} value={cr.id}>
                                            {cr.name} ({cr.email})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || (mode === 'assign' && unassignedCRs.length === 0)}>
                            {isLoading ? 'Assigning...' : mode === 'create' ? 'Create & Assign' : 'Assign CR'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
