import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TimetableGrid } from '../components/TimetableGrid';
import { useAuth } from '../context/AuthContext';
import { TimetableRepository } from '../services/timetableRepository';
import { SubjectRepository } from '../services/subjectRepository';
import { TimetableEntry, Subject } from '../types';

export const TimetablePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [_saving, setSaving] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

    useEffect(() => {
        if (!user || user.role !== 'CR') {
            navigate('/');
            return;
        }
        loadTimetable();
    }, [user, navigate]);

    const loadTimetable = async () => {
        if (!user || !user.classId) return;
        try {
            // Load subjects for the class
            const loadedSubjects = await SubjectRepository.getSubjectsByClassId(user.classId);
            setSubjects(loadedSubjects);

            // Load timetable data
            const data = await TimetableRepository.getTimetableByClassId(user.classId);
            // Convert 2D array to flat TimetableEntry array
            const flatEntries: TimetableEntry[] = [];
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            data.forEach((daySlots, dayIndex) => {
                daySlots.forEach((slot) => {
                    if (slot.subjectName) {
                        flatEntries.push({
                            day: dayNames[dayIndex],
                            periodIndex: slot.periodIndex - 1, // Convert to 0-indexed
                            subject: slot.subjectName,
                            type: slot.subjectType || '',
                            subjectId: slot.subjectId, // Phase 4 - for future use
                        });
                    }
                });
            });
            setEntries(flatEntries);
        } catch (error) {
            console.error('Error loading timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (newEntries: TimetableEntry[]) => {
        if (!user || !user.classId) return;
        setSaving(true);
        try {
            // Convert flat entries back to 2D grid
            const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const grid: any[][] = days.map(() => []);

            // Default times for each period
            const times = [
                { start: '09:00', end: '09:50' },
                { start: '10:00', end: '10:50' },
                { start: '11:00', end: '11:50' },
                { start: '12:00', end: '12:50' },
                { start: '13:00', end: '13:50' },
                { start: '14:00', end: '14:50' },
                { start: '15:00', end: '15:50' },
                { start: '16:00', end: '16:50' },
                { start: '17:00', end: '17:50' },
            ];

            newEntries.forEach(entry => {
                const dayIndex = dayNames.indexOf(entry.day);
                if (dayIndex !== -1) {
                    const periodIndex = entry.periodIndex + 1; // Convert to 1-indexed
                    const time = times[entry.periodIndex] || times[0];

                    grid[dayIndex].push({
                        dayOfWeek: days[dayIndex],
                        periodIndex: periodIndex,
                        timeStart: time.start,
                        timeEnd: time.end,
                        subjectName: entry.subject,
                        subjectType: entry.type,
                        subjectId: entry.subjectId, // Save subject_id
                    });
                }
            });

            await TimetableRepository.saveTimetableForClass(user.classId, grid);
            setEntries(newEntries);
        } catch (error) {
            console.error('Error saving timetable:', error);
            alert('Failed to save timetable');
        } finally {
            setSaving(false);
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
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-primary-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Class Timetable</h1>
                            <p className="text-gray-600">Manage weekly schedule</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        <p><strong>Instructions:</strong> Click on any cell to select a subject from the dropdown. Choose the type (T/P/Lab) and click Save to confirm.</p>
                    </div>

                    <TimetableGrid
                        entries={entries}
                        subjects={subjects}
                        editable={true}
                        onSave={handleSave}
                    />
                </Card>
            </div>
        </Layout>
    );
};
