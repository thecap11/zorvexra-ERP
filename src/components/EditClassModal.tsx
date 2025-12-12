import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Edit } from 'lucide-react';
import { ClassRepository, CreateClassDTO, Class } from '../services/classRepository';
import { Button } from './Button';

interface EditClassModalProps {
    isOpen: boolean;
    classToEdit: Class | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({
    isOpen,
    classToEdit,
    onClose,
    onSuccess,
}) => {
    const [name, setName] = useState('');
    const [section, setSection] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (classToEdit) {
            setName(classToEdit.name);
            setSection(classToEdit.section || '');
        }
    }, [classToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Class name is required');
            return;
        }

        if (!classToEdit) return;

        setIsLoading(true);

        try {
            const dto: CreateClassDTO = {
                name: name.trim(),
                section: section.trim() || null,
            };

            const success = await ClassRepository.updateClass(classToEdit.id, dto);

            if (success) {
                onSuccess();
                onClose();
            } else {
                setError('Failed to update class');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !classToEdit) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                            <Edit className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Edit Class</h3>
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

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Class Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            placeholder="e.g., Class 10, BCA 1st Year"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Section <span className="text-slate-400">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                            placeholder="e.g., A, B, Morning"
                            maxLength={50}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
