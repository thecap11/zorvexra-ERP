import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ClassRepository, ClassWithStats } from '../services/classRepository';
import { CreateClassModal } from '../components/CreateClassModal';
import { EditClassModal } from '../components/EditClassModal';
import { School, GraduationCap, Edit, Trash2 } from 'lucide-react';

export const AdminClassesPage: React.FC = () => {
    const [classes, setClasses] = useState<ClassWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassWithStats | null>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setIsLoading(true);
        const data = await ClassRepository.getAllClassesWithStats();
        setClasses(data);
        setIsLoading(false);
    };

    const handleEdit = (cls: ClassWithStats) => {
        setSelectedClass(cls);
        setShowEditModal(true);
    };

    const handleDelete = async (cls: ClassWithStats) => {
        if (
            !confirm(
                `Delete "${cls.name}${cls.section ? ` - ${cls.section}` : ''}"?\n\nThis will permanently delete:\n- All students (${cls.studentCount})\n- CR assignment\n- All tasks, attendance, and timetable data\n\nThis action cannot be undone.`
            )
        ) {
            return;
        }

        const success = await ClassRepository.deleteClass(cls.id);
        if (success) {
            fetchClasses();
        } else {
            alert('Failed to delete class');
        }
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Manage Classes</h1>
                        <p className="text-slate-600 mt-1">Create, edit, and assign CRs to classes</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <School className="w-5 h-5 mr-2" />
                        Create New Class
                    </Button>
                </div>

                {/* Classes Table */}
                <Card>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 text-slate-500">Loading classes...</p>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-12">
                            <School className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No classes yet</h3>
                            <p className="text-slate-500 mb-4">Create your first class to get started</p>
                            <Button onClick={() => setShowCreateModal(true)}>Create Class</Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            Class Name
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            Section
                                        </th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                                            Assigned CR
                                        </th>
                                        <th className="text-center px-4 py-3 text-sm font-semibold text-slate-700">
                                            Students
                                        </th>
                                        <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {classes.map((cls) => (
                                        <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className="font-medium text-slate-900">{cls.name}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-slate-600">{cls.section || '-'}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {cls.cr1Name || cls.cr2Name ? (
                                                    <div className="space-y-2">
                                                        {cls.cr1Name && (
                                                            <div>
                                                                <p className="font-medium text-slate-900 text-sm">
                                                                    {cls.cr1Name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {cls.cr1Email}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {cls.cr2Name && (
                                                            <div className="pt-1 border-t border-slate-100">
                                                                <p className="font-medium text-slate-900 text-sm">
                                                                    {cls.cr2Name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {cls.cr2Email}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                    <GraduationCap className="w-4 h-4" />
                                                    {cls.studentCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(cls)}
                                                        className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cls)}
                                                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modals */}
            <CreateClassModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchClasses}
            />

            <EditClassModal
                isOpen={showEditModal}
                classToEdit={selectedClass}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedClass(null);
                }}
                onSuccess={fetchClasses}
            />
        </Layout>
    );
};
