import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { ClassRepository, ClassWithStats } from '../services/classRepository';
import { AssignCRModal } from '../components/AssignCRModal';
import { ChangeCRPasswordModal } from '../components/ChangeCRPasswordModal';
import { UserPlus, Users, CheckCircle, XCircle, Key } from 'lucide-react';

export const AssignCRsPage: React.FC = () => {
    const [classes, setClasses] = useState<ClassWithStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAssignCRModal, setShowAssignCRModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassWithStats | null>(null);
    const [selectedCR, setSelectedCR] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setIsLoading(true);
        const data = await ClassRepository.getAllClassesWithStats();
        setClasses(data);
        setIsLoading(false);
    };

    const handleAssignCR = (cls: ClassWithStats) => {
        setSelectedClass(cls);
        setShowAssignCRModal(true);
    };

    const handleRemoveCR = async (crId: string, crName: string, className: string) => {
        if (!confirm(`Remove ${crName} as CR from ${className}?\n\nThey will lose access to this class's data.`)) {
            return;
        }

        const success = await ClassRepository.removeCRFromClass(crId);
        if (success) {
            fetchClasses();
        } else {
            alert('Failed to remove CR');
        }
    };

    const handleChangePassword = (crId: string, crName: string) => {
        setSelectedCR({ id: crId, name: crName });
        setShowPasswordModal(true);
    };

    const assignedCount = classes.filter((c) => c.cr1Name || c.cr2Name).length;
    const unassignedCount = classes.length - assignedCount;

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Assign Class Representatives</h1>
                    <p className="text-slate-600 mt-1">
                        Create or assign CRs to manage each class
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Total Classes</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {classes.length}
                                </p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <Users className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">CRs Assigned</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {assignedCount}
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-amber-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Unassigned</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {unassignedCount}
                                </p>
                            </div>
                            <div className="bg-amber-100 p-3 rounded-lg">
                                <XCircle className="w-8 h-8 text-amber-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Classes List */}
                <Card title="Class CR Assignments" subtitle="Assign a CR to each class">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 text-slate-500">Loading classes...</p>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                No classes yet
                            </h3>
                            <p className="text-slate-500">Create classes first to assign CRs</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classes.map((cls) => (
                                <div
                                    key={cls.id}
                                    className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-lg">
                                                {cls.name}
                                            </h3>
                                            {cls.section && (
                                                <p className="text-sm text-slate-500">
                                                    Section {cls.section}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            {cls.studentCount} students
                                        </span>
                                    </div>

                                    {cls.cr1Name || cls.cr2Name ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-medium text-green-700">
                                                    {cls.cr1Name && cls.cr2Name
                                                        ? '2 CRs Assigned'
                                                        : '1 CR Assigned'}
                                                </span>
                                            </div>
                                            {cls.cr1Name && (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 text-sm">
                                                            CR 1: {cls.cr1Name}
                                                        </p>
                                                        <p className="text-xs text-slate-600">{cls.cr1Email}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleChangePassword(cls.cr1Id!, cls.cr1Name!)}
                                                            className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                                                            title="Change Password"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveCR(cls.cr1Id!, cls.cr1Name!, cls.name)}
                                                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                                            title="Remove CR"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {cls.cr2Name && (
                                                <div className="pt-1 border-t border-green-100 flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 text-sm">
                                                            CR 2: {cls.cr2Name}
                                                        </p>
                                                        <p className="text-xs text-slate-600">{cls.cr2Email}</p>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleChangePassword(cls.cr2Id!, cls.cr2Name!)}
                                                            className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                                                            title="Change Password"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveCR(cls.cr2Id!, cls.cr2Name!, cls.name)}
                                                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                                            title="Remove CR"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-amber-600" />
                                                <span className="text-xs font-medium text-amber-700">
                                                    No CR Assigned
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleAssignCR(cls)}
                                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        {cls.cr1Name && cls.cr2Name
                                            ? 'Change CRs'
                                            : cls.cr1Name || cls.cr2Name
                                                ? 'Add 2nd CR'
                                                : 'Assign CR'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Modals */}
            <AssignCRModal
                isOpen={showAssignCRModal}
                classId={selectedClass?.id || null}
                className={
                    selectedClass
                        ? `${selectedClass.name}${selectedClass.section ? ` - ${selectedClass.section}` : ''}`
                        : null
                }
                onClose={() => {
                    setShowAssignCRModal(false);
                    setSelectedClass(null);
                }}
                onSuccess={fetchClasses}
            />

            <ChangeCRPasswordModal
                isOpen={showPasswordModal}
                crId={selectedCR?.id || null}
                crName={selectedCR?.name || null}
                onClose={() => {
                    setShowPasswordModal(false);
                    setSelectedCR(null);
                }}
                onSuccess={fetchClasses}
            />
        </Layout>
    );
};
