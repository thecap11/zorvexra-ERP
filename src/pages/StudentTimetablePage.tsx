import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TimetableGrid } from '../components/TimetableGrid';
import { useAuth } from '../context/AuthContext';
import { TimetableRepository } from '../services/timetableRepository';
import { TimetableEntry } from '../types';

export const StudentTimetablePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        loadTimetable();
    }, [user, navigate]);

    const loadTimetable = async () => {
        if (!user) return;
        try {
            console.log('====== STUDENT TIMETABLE LOADING ======');
            console.log('User:', { id: user.id, role: user.role, classId: user.classId });
            console.log('Fetching timetable for classId:', user.classId);

            const data = await TimetableRepository.getTimetable(user.classId);

            console.log('✅ Timetable data received:', {
                entriesCount: data.length,
                hasData: data.length > 0,
                firstEntry: data[0] || null
            });

            if (data.length === 0) {
                console.warn('⚠️ No timetable entries found for class:', user.classId);
                console.warn('Possible reasons:');
                console.warn('1. CR has not created timetable yet');
                console.warn('2. RLS policies blocking access (check Supabase RLS)');
                console.warn('3. Class ID mismatch');
            }

            setEntries(data);
        } catch (error) {
            console.error('❌ Error loading timetable:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                classId: user.classId,
                userId: user.id
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-screen">
                    <LoadingSpinner size="lg" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Calendar className="w-8 h-8 text-primary-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Class Timetable</h1>
                        <p className="text-gray-600">Weekly schedule view</p>
                    </div>
                </div>

                <Card>
                    {entries.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Timetable Available</h3>
                            <p className="text-slate-500 mb-1">Your class timetable hasn't been created yet.</p>
                            <p className="text-sm text-slate-400">Please contact your CR or check back later.</p>
                        </div>
                    ) : (
                        <TimetableGrid
                            entries={entries}
                            subjects={[]} // Students don't need subject management
                            editable={false}
                        />
                    )}
                </Card>
            </div>
        </Layout>
    );
};
