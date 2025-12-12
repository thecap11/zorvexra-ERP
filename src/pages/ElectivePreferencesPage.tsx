import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { User, Subject } from '../types';
import { UserRepository } from '../services/userRepository';
import { SubjectRepository } from '../services/subjectRepository';
import { Users, BookOpen, AlertCircle } from 'lucide-react';

interface PreferenceState {
    [studentId: string]: {
        [subjectId: string]: string | null; // optionId or null
    };
}

export const ElectivePreferencesPage: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<User[]>([]);
    const [preferredSubjects, setPreferredSubjects] = useState<Subject[]>([]);
    const [preferences, setPreferences] = useState<PreferenceState>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Load students
            const fetchedStudents = await UserRepository.getStudentsByClassId(user.classId);
            setStudents(fetchedStudents);

            // Load preferred subjects with options
            const allSubjects = await SubjectRepository.getSubjectsByClassId(user.classId);
            const preferred = allSubjects.filter(s => s.type === 'PREFERRED_GROUP');

            // Load options for each preferred subject
            const subjectsWithOptions = await Promise.all(
                preferred.map(async (subject) => {
                    const options = await SubjectRepository.getOptionsBySubjectId(subject.id);
                    return { ...subject, options };
                })
            );
            setPreferredSubjects(subjectsWithOptions);

            // Load existing preferences
            const allPreferences = await SubjectRepository.getPreferencesForClass(user.classId);

            // Build preference state
            const prefState: PreferenceState = {};
            fetchedStudents.forEach(student => {
                prefState[student.id] = {};
                subjectsWithOptions.forEach(subject => {
                    const existing = allPreferences.find(
                        p => p.studentId === student.id && p.subjectId === subject.id
                    );
                    prefState[student.id][subject.id] = existing ? existing.optionId : null;
                });
            });
            setPreferences(prefState);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (
        studentId: string,
        subjectId: string,
        optionId: string
    ) => {
        // Update local state
        setPreferences(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subjectId]: optionId === '' ? null : optionId
            }
        }));

        // Save to Supabase
        setSaving(true);
        try {
            await SubjectRepository.setStudentPreference(
                studentId,
                subjectId,
                optionId === '' ? null : optionId
            );
        } catch (error) {
            console.error('Error saving preference:', error);
            alert('Failed to save preference');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-600">Loading preferences...</div>
                </div>
            </Layout>
        );
    }

    if (preferredSubjects.length === 0) {
        return (
            <Layout>
                <Card>
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">
                            No Elective Groups Found
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Create preferred subjects in the Course Structure page first.
                        </p>
                        <a
                            href="/cr/course-structure"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Course Structure
                        </a>
                    </div>
                </Card>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-slate-900">Elective Preferences</h1>
                    </div>
                    <p className="text-slate-600">
                        Assign elective options (like German/French, C/Java) to each student
                    </p>
                </div>

                {/* Info Alert */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">How to use this page:</p>
                        <p>Select an option for each student from the dropdowns below. Changes are saved automatically.</p>
                    </div>
                </div>

                {/* Table Card */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky left-0">
                                        Student
                                    </th>
                                    {preferredSubjects.map(subject => (
                                        <th
                                            key={subject.id}
                                            className="text-left py-3 px-4 font-semibold text-slate-700 bg-slate-50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                                {subject.name}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr
                                        key={student.id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="py-3 px-4 sticky left-0 bg-white font-medium text-slate-900">
                                            <div>
                                                <div>{student.name}</div>
                                                {student.rollNo && (
                                                    <div className="text-xs text-slate-500">
                                                        Roll No: {student.rollNo}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {preferredSubjects.map(subject => (
                                            <td key={subject.id} className="py-3 px-4">
                                                <select
                                                    value={preferences[student.id]?.[subject.id] || ''}
                                                    onChange={(e) => handlePreferenceChange(
                                                        student.id,
                                                        subject.id,
                                                        e.target.value
                                                    )}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    disabled={saving}
                                                >
                                                    <option value="">Not set</option>
                                                    {subject.options?.map(option => (
                                                        <option key={option.id} value={option.id}>
                                                            {option.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Status Indicator */}
                    {saving && (
                        <div className="mt-4 text-center text-sm text-slate-600">
                            Saving...
                        </div>
                    )}
                </Card>

                {/* Student Count */}
                <div className="text-sm text-slate-500 text-center">
                    Showing {students.length} student{students.length !== 1 ? 's' : ''} × {preferredSubjects.length} elective group{preferredSubjects.length !== 1 ? 's' : ''}
                </div>
            </div>
        </Layout>
    );
};
