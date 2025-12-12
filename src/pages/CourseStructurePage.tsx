import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Subject, SubjectType } from '../types';
import { SubjectRepository } from '../services/subjectRepository';
import { Book, Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { Button } from '../components/Button';

interface SubjectFormData {
    name: string;
    type: SubjectType;
    options: string[];
}

export const CourseStructurePage: React.FC = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState<SubjectFormData>({
        name: '',
        type: 'NORMAL',
        options: ['', '']
    });

    useEffect(() => {
        if (user) {
            loadSubjects();
        }
    }, [user]);

    const loadSubjects = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const fetchedSubjects = await SubjectRepository.getSubjectsByClassId(user.classId);

            // Load options for preferred subjects
            const subjectsWithOptions = await Promise.all(
                fetchedSubjects.map(async (subject) => {
                    if (subject.type === 'PREFERRED_GROUP') {
                        const options = await SubjectRepository.getOptionsBySubjectId(subject.id);
                        return { ...subject, options };
                    }
                    return subject;
                })
            );

            setSubjects(subjectsWithOptions);
        } catch (error) {
            console.error('Error loading subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = () => {
        setEditingSubject(null);
        setFormData({
            name: '',
            type: 'NORMAL',
            options: ['', '']
        });
        setShowModal(true);
    };

    const handleEditSubject = async (subject: Subject) => {
        setEditingSubject(subject);

        // Load options if preferred subject
        let options = ['', ''];
        if (subject.type === 'PREFERRED_GROUP') {
            const loadedOptions = await SubjectRepository.getOptionsBySubjectId(subject.id);
            options = loadedOptions.map(opt => opt.name);
            if (options.length < 2) options.push('', '');
        }

        setFormData({
            name: subject.name,
            type: subject.type,
            options
        });
        setShowModal(true);
    };

    const handleDeleteSubject = async (subject: Subject) => {
        if (!confirm(`Are you sure you want to delete "${subject.name}"? This cannot be undone.`)) {
            return;
        }

        try {
            // Check if can delete
            const { canDelete, reason } = await SubjectRepository.canDeleteSubject(subject.id);
            if (!canDelete) {
                alert(reason);
                return;
            }

            const success = await SubjectRepository.deleteSubject(subject.id);
            if (success) {
                alert('Subject deleted successfully');
                loadSubjects();
            } else {
                alert('Failed to delete subject');
            }
        } catch (error) {
            console.error('Error deleting subject:', error);
            alert('Error deleting subject');
        }
    };

    const handleSaveSubject = async () => {
        if (!user) return;

        // Validation
        if (!formData.name.trim()) {
            alert('Please enter a subject name');
            return;
        }

        if (formData.type === 'PREFERRED_GROUP') {
            const validOptions = formData.options.filter(opt => opt.trim() !== '');
            if (validOptions.length < 2) {
                alert('Preferred subjects must have at least 2 options');
                return;
            }
        }

        try {
            if (editingSubject) {
                // Update existing subject
                await SubjectRepository.updateSubject(editingSubject.id, {
                    name: formData.name,
                    type: formData.type,
                    classId: user.classId,
                    id: editingSubject.id,
                    createdAt: editingSubject.createdAt
                });

                // Update options if preferred
                if (formData.type === 'PREFERRED_GROUP') {
                    const validOptions = formData.options.filter(opt => opt.trim() !== '');
                    await SubjectRepository.updateSubjectOptions(editingSubject.id, validOptions);
                }

                alert('Subject updated successfully');
            } else {
                // Create new subject
                const newSubject = await SubjectRepository.createSubject({
                    name: formData.name,
                    type: formData.type,
                    classId: user.classId
                });

                // Create options if preferred
                if (formData.type === 'PREFERRED_GROUP') {
                    const validOptions = formData.options.filter(opt => opt.trim() !== '');
                    await SubjectRepository.updateSubjectOptions(newSubject.id, validOptions);
                }

                alert('Subject created successfully');
            }

            setShowModal(false);
            loadSubjects();
        } catch (error) {
            console.error('Error saving subject:', error);
            alert('Error saving subject');
        }
    };

    const addOptionField = () => {
        setFormData({
            ...formData,
            options: [...formData.options, '']
        });
    };

    const removeOptionField = (index: number) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            options: newOptions
        });
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({
            ...formData,
            options: newOptions
        });
    };

    const normalSubjects = subjects.filter(s => s.type === 'NORMAL');
    const preferredSubjects = subjects.filter(s => s.type === 'PREFERRED_GROUP');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-600">Loading subjects...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Course Structure</h1>
                    <p className="text-slate-600 mt-1">Manage subjects and elective groups for your class</p>
                </div>
                <Button onClick={handleAddSubject} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Subject
                </Button>
            </div>

            {/* Normal Subjects Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Normal Subjects
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    {normalSubjects.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No normal subjects yet. Click "Add Subject" to create one.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {normalSubjects.map(subject => (
                                <div key={subject.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{subject.name}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                            Normal
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditSubject(subject)}
                                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSubject(subject)}
                                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Elective Groups Section */}
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Elective Groups
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    {preferredSubjects.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No elective groups yet. Create one to offer students choice between subjects.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {preferredSubjects.map(subject => (
                                <div key={subject.id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900">{subject.name}</h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                                Elective
                                            </span>
                                            {subject.options && subject.options.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {subject.options.map(option => (
                                                        <span key={option.id} className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-slate-100 text-slate-700 border border-slate-200">
                                                            {option.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditSubject(subject)}
                                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSubject(subject)}
                                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingSubject ? 'Edit Subject' : 'Add Subject'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Subject Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Subject Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Mathematics, Language Elective"
                                />
                            </div>

                            {/* Subject Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Type *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SubjectType })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="NORMAL">Normal - All students attend</option>
                                    <option value="PREFERRED_GROUP">Elective - Students choose an option</option>
                                </select>
                            </div>

                            {/* Options (if Preferred) */}
                            {formData.type === 'PREFERRED_GROUP' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Options * (minimum 2)
                                    </label>
                                    <div className="space-y-2">
                                        {formData.options.map((option, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(index, e.target.value)}
                                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder={`Option ${index + 1} (e.g., German, French)`}
                                                />
                                                {formData.options.length > 2 && (
                                                    <button
                                                        onClick={() => removeOptionField(index)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addOptionField}
                                        className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Option
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <Button onClick={handleSaveSubject}>
                                {editingSubject ? 'Update Subject' : 'Create Subject'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
