import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Edit, Trash2, ArrowUp, ArrowDown, Shield, Key } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import AddStudentModal from '../components/AddStudentModal';
import EditStudentModal from '../components/EditStudentModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { useAuth } from '../context/AuthContext';
import { UserRepository } from '../services/userRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';
import { User } from '../types';

const StudentManagementPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<User[]>([]);
    const [crs, setCRs] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        if (!user || user.role !== 'CR') {
            navigate('/');
            return;
        }
        loadData();
    }, [user, navigate]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [studentsData, crsData] = await Promise.all([
                UserRepository.getStudentsByClassId(user.classId),
                UserRepository.getCRsByClassId(user.classId),
            ]);
            setStudents(studentsData.sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '')));
            setCRs(crsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = (student: User) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Student',
            message: `Are you sure you want to remove ${student.name}? This will also remove their assignment and attendance records.`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await TaskStatusRepository.deleteStatusesByStudentId(student.id);
                    await UserRepository.deleteUser(student.id);
                    await loadData();
                } catch (error) {
                    alert(error instanceof Error ? error.message : 'Failed to delete student');
                }
            },
        });
    };

    const handlePromoteToCR = (student: User) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Promote to CR',
            message: `Make ${student.name} a Class Representative? They will gain CR permissions.`,
            variant: 'warning',
            onConfirm: async () => {
                try {
                    await UserRepository.changeUserRole(student.id, 'CR');
                    await loadData();
                } catch (error) {
                    alert(error instanceof Error ? error.message : 'Failed to promote student');
                }
            },
        });
    };

    const handleDemoteToStudent = (cr: User) => {
        if (UserRepository.isPrimaryCR(cr.id)) {
            alert('Cannot demote the primary CR account');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Demote to Student',
            message: `Demote ${cr.name} to Student? They will lose CR permissions.`,
            variant: 'warning',
            onConfirm: async () => {
                try {
                    // Check if CR has a roll number, if not, prompt for one
                    if (!cr.rollNo) {
                        const rollNo = prompt('Enter roll number for this student:');
                        if (!rollNo) return;

                        const rollNoUnique = await UserRepository.isRollNoUnique(cr.classId, rollNo, cr.id);
                        if (!rollNoUnique) {
                            alert('Roll number already exists in this class');
                            return;
                        }

                        await UserRepository.updateUser(cr.id, { rollNo });
                    }

                    await UserRepository.changeUserRole(cr.id, 'STUDENT');
                    await loadData();
                } catch (error) {
                    alert(error instanceof Error ? error.message : 'Failed to demote CR');
                }
            },
        });
    };

    const handleEditStudent = (student: User) => {
        setSelectedStudent(student);
        setShowEditModal(true);
    };

    const handleResetPassword = (student: User) => {
        setSelectedStudent(student);
        setShowResetPasswordModal(true);
    };

    const handleUpdateLanguage = async (student: User, language: 'GERMAN' | 'FRENCH' | null) => {
        try {
            await UserRepository.updatePreferredLanguage(student.id, language);
            await loadData();

            const languageText = language === null ? 'cleared' : language;
            alert(`Language preference updated to ${languageText} for ${student.name}`);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to update language preference');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center min-h-screen">
                    <LoadingSpinner />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Management</h1>
                    <p className="text-slate-600">Manage students and class representatives</p>
                </div>

                {/* Students Section */}
                <Card className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary-600" />
                            <h2 className="text-xl font-semibold text-slate-900">Students</h2>
                            <span className="text-sm text-slate-500">({students.length})</span>
                        </div>
                        <Button variant="primary" onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white">
                            Add Student
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Roll No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Language</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            No students found. Click "Add Student" to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900">{student.rollNo}</td>
                                            <td className="px-4 py-3 text-slate-900">{student.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{student.email}</td>
                                            <td className="px-4 py-3">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={student.preferredLanguage || ''}
                                                        onChange={(e) => handleUpdateLanguage(
                                                            student,
                                                            e.target.value === '' ? null : e.target.value as 'GERMAN' | 'FRENCH'
                                                        )}
                                                        className="text-sm px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                                    >
                                                        <option value="">Not Assigned</option>
                                                        <option value="GERMAN">German</option>
                                                        <option value="FRENCH">French</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleResetPassword(student)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditStudent(student)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePromoteToCR(student)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                        title="Promote to CR"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStudent(student)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* CRs Section */}
                <Card>
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-6 h-6 text-primary-600" />
                        <h2 className="text-xl font-semibold text-slate-900">Class Representatives</h2>
                        <span className="text-sm text-slate-500">({crs.length})</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {crs.map(cr => (
                                    <tr key={cr.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-slate-900">{cr.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{cr.email}</td>
                                        <td className="px-4 py-3">
                                            {UserRepository.isPrimaryCR(cr.id) && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                                    Primary CR
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleDemoteToStudent(cr)}
                                                    disabled={UserRepository.isPrimaryCR(cr.id)}
                                                    className={`p-2 rounded transition-colors ${UserRepository.isPrimaryCR(cr.id)
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-orange-600 hover:bg-orange-50'
                                                        }`}
                                                    title={UserRepository.isPrimaryCR(cr.id) ? 'Cannot demote primary CR' : 'Demote to Student'}
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modals */}
            <AddStudentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={loadData}
                classId={user?.classId || ''}
            />

            <EditStudentModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                }}
                onSuccess={loadData}
                student={selectedStudent}
            />

            <ResetPasswordModal
                isOpen={showResetPasswordModal}
                onClose={() => {
                    setShowResetPasswordModal(false);
                    setSelectedStudent(null);
                }}
                student={selectedStudent}
                onSuccess={loadData}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                variant={confirmDialog.variant}
            />
        </Layout>
    );
};

export default StudentManagementPage;
