import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Clock, ChevronLeft, Download, AlertTriangle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar } from '../components/Calendar';
import { useAuth } from '../context/AuthContext';
import { TaskRepository } from '../services/taskRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';
import { UserRepository } from '../services/userRepository';
import { TimetableRepository } from '../services/timetableRepository';
import { SubjectRepository } from '../services/subjectRepository';
import { ExportService } from '../services/exportService';
import { User, Task, TimetableEntry, Subject, SubjectOption } from '../types';
import { isLanguagePeriod, countStudentsWithoutLanguage } from '../utils/languageUtils';

interface StudentAttendance {
    student: User;
    status: 'PRESENT' | 'ABSENT';
    statusId?: string;
}

const PERIOD_TIMES = [
    '09:30 AM - 10:20 AM',
    '10:20 AM - 11:10 AM',
    '11:10 AM - 12:00 PM',
    '12:00 PM - 12:50 PM',
    '01:20 PM - 02:10 PM',
    '02:10 PM - 03:00 PM',
    '03:00 PM - 03:50 PM',
    '03:50 PM - 04:40 PM',
];

export const AttendanceCalendarPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [dayTimetable, setDayTimetable] = useState<TimetableEntry[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<TimetableEntry | null>(null);
    const [attendanceTask, setAttendanceTask] = useState<Task | null>(null);
    const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(false);
    const [markedDates, setMarkedDates] = useState<{ date: string; status: 'full' | 'partial' | 'none' }[]>([]);
    const [periodStatuses, setPeriodStatuses] = useState<Record<number, boolean>>({});
    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [allClassStudents, setAllClassStudents] = useState<User[]>([]); // For warning count
    const [selectedLanguage, setSelectedLanguage] = useState<'GERMAN' | 'FRENCH'>('GERMAN'); // For language period tab switching

    // Phase 5: Elective subject filtering
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const [electiveOptions, setElectiveOptions] = useState<SubjectOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'CR') {
            navigate('/');
            return;
        }
        loadMarkedDates();
        // Load all students for warning count
        UserRepository.getStudentsAndCRsForAttendance(user.classId).then(setAllClassStudents);
    }, [user, navigate]);

    useEffect(() => {
        if (selectedDate && user) {
            loadDayTimetable(selectedDate);
            setSelectedPeriod(null);

            // Auto-select week based on date
            const day = selectedDate.getDate();
            if (day <= 7) setSelectedWeek(1);
            else if (day <= 14) setSelectedWeek(2);
            else if (day <= 21) setSelectedWeek(3);
            else setSelectedWeek(4);
        }
    }, [selectedDate, user]);

    useEffect(() => {
        if (selectedPeriod && selectedDate) {
            loadAttendanceForPeriod(selectedDate, selectedPeriod);
        }
    }, [selectedPeriod, selectedDate]);

    // Phase 5: Detect if selected period is an elective subject
    useEffect(() => {
        const detectSubjectType = async () => {
            if (selectedPeriod?.subjectId) {
                try {
                    const subject = await SubjectRepository.getSubjectById(selectedPeriod.subjectId);
                    setCurrentSubject(subject || null);

                    if (subject?.type === 'PREFERRED_GROUP' && subject.options) {
                        console.log('Elective options:', subject.options);
                        setElectiveOptions(subject.options);
                        setSelectedOption(subject.options[0]?.id || null);
                    } else {
                        setElectiveOptions([]);
                        setSelectedOption(null);
                    }
                } catch (error) {
                    console.error('Error detecting subject type:', error);
                    setCurrentSubject(null);
                    setElectiveOptions([]);
                    setSelectedOption(null);
                }
            } else {
                // No subject_id, fall back to old behavior
                setCurrentSubject(null);
                setElectiveOptions([]);
                setSelectedOption(null);
            }
        };

        if (selectedPeriod) {
            detectSubjectType();
        }
    }, [selectedPeriod]);

    const loadMarkedDates = async () => {
        if (!user) return;
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];

        const tasks = await TaskRepository.getAttendanceTasksInRange(user.classId, startDate, endDate);

        const dateMap = new Map<string, number>();
        tasks.forEach(t => {
            const date = t.attendanceDate || t.createdAt.split('T')[0];
            dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });

        const marked = Array.from(dateMap.entries()).map(([date, count]) => ({
            date,
            status: count > 0 ? 'partial' as const : 'none' as const
        }));

        setMarkedDates(marked);
    };

    const loadDayTimetable = async (date: Date) => {
        if (!user) return;
        setLoading(true);
        try {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[date.getDay()];

            const entries = await TimetableRepository.getTimetableForDay(user.classId, dayName);
            setDayTimetable(entries.sort((a, b) => a.periodIndex - b.periodIndex));

            const dateStr = date.toISOString().split('T')[0];
            const statuses: Record<number, boolean> = {};

            for (const entry of entries) {
                const task = await TaskRepository.getAttendanceTaskByDateAndPeriod(
                    user.classId,
                    dateStr,
                    entry.periodIndex
                );
                statuses[entry.periodIndex] = !!task;
            }
            setPeriodStatuses(statuses);

        } catch (error) {
            console.error('Error loading timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAttendanceForPeriod = async (date: Date, period: TimetableEntry) => {
        if (!user) return;
        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            console.log('Loading attendance for:', { date: dateStr, period: period.periodIndex, subject: period.subject });

            const task = await TaskRepository.getAttendanceTaskByDateAndPeriod(
                user.classId,
                dateStr,
                period.periodIndex
            );

            if (task) {
                console.log('Found existing attendance task:', task.id);
                setAttendanceTask(task);

                // IMPORTANT: For language periods, restore the language tab
                if (isLanguagePeriod(period.subject)) {
                    console.log('Language period detected, defaulting to GERMAN tab');
                    setSelectedLanguage('GERMAN');
                    await loadStudentStatuses(task.id, 'GERMAN');
                } else {
                    await loadStudentStatuses(task.id);
                }
            } else {
                console.log('No existing attendance task found, creating new one');
                await createAttendanceRecord(date, period);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudentStatuses = async (taskId: string, languageFilter?: 'GERMAN' | 'FRENCH') => {
        if (!user || !selectedPeriod) return;

        console.log('====== LOADING STUDENT STATUSES ======');
        console.log('Task ID:', taskId);
        console.log('Selected Period:', selectedPeriod.subject);
        console.log('Language Filter:', languageFilter);
        console.log('Current Subject:', currentSubject);
        console.log('Selected Option:', selectedOption);

        // Use filtered method based on subject type
        let students: User[];
        const allStudents = await UserRepository.getStudentsAndCRsForAttendance(user.classId);

        console.log('All students fetched:', allStudents.length);

        // Phase 5: Filter by elective option if subject is PREFERRED_GROUP
        if (currentSubject?.type === 'PREFERRED_GROUP' && selectedOption) {
            if (selectedOption === 'UNASSIGNED') {
                // Show students without a preference for this subject
                const preferences = await SubjectRepository.getPreferencesBySubjectId(currentSubject.id);
                const assignedStudentIds = preferences.map(p => p.studentId);
                students = allStudents.filter(s => !assignedStudentIds.includes(s.id));
                console.log(`Elective period (UNASSIGNED) - showing ${students.length} students without preferences`);
            } else {
                // Show students who chose this specific option
                const preferences = await SubjectRepository.getPreferencesBySubjectId(currentSubject.id);
                const eligibleStudentIds = preferences
                    .filter(p => p.optionId === selectedOption)
                    .map(p => p.studentId);
                students = allStudents.filter(s => eligibleStudentIds.includes(s.id));
                console.log(`Elective period (${selectedOption}) - filtered to ${students.length} students`);
            }
        } else if (isLanguagePeriod(selectedPeriod.subject)) {
            // Legacy: Filter by the selected language tab (for old timetable entries)
            const filterLang = languageFilter || selectedLanguage;
            students = allStudents.filter(s => s.preferredLanguage === filterLang);
            console.log(`Language period (legacy) - filtered to ${students.length} students with language: ${filterLang}`);
        } else {
            students = allStudents;
            console.log('Regular period - showing all students');
        }

        const statuses = await TaskStatusRepository.getTaskStatusesByTask(taskId);
        console.log('Fetched task statuses from DB:', statuses.length);

        const attendances: StudentAttendance[] = students.map(student => {
            const status = statuses.find(s => s.studentId === student.id);
            return {
                student,
                status: (status?.status as 'PRESENT' | 'ABSENT') || 'ABSENT',
                statusId: status?.id,
            };
        });

        console.log('Setting student attendances:', {
            total: attendances.length,
            present: attendances.filter(a => a.status === 'PRESENT').length,
            absent: attendances.filter(a => a.status === 'ABSENT').length
        });

        setStudentAttendances(attendances);
    };

    const createAttendanceRecord = async (date: Date, period: TimetableEntry) => {
        if (!user) return;
        try {
            const dateStr = date.toISOString().split('T')[0];
            const task = await TaskRepository.createAttendanceTaskForPeriod(
                user.classId,
                dateStr,
                period.periodIndex,
                period.subject,
                user.id
            );

            await TaskStatusRepository.initializeTaskStatusesForTask(
                task.id,
                user.classId,
                'ATTENDANCE'
            );

            setAttendanceTask(task);

            // For language periods, default to GERMAN tab
            if (isLanguagePeriod(period.subject)) {
                setSelectedLanguage('GERMAN');
                await loadStudentStatuses(task.id, 'GERMAN');
            } else {
                await loadStudentStatuses(task.id);
            }

            setPeriodStatuses(prev => ({
                ...prev,
                [period.periodIndex]: true
            }));

            loadMarkedDates();
        } catch (error) {
            console.error('Error creating attendance:', error);
        }
    };

    const handleToggleAttendance = async (studentId: string, currentStatus: 'PRESENT' | 'ABSENT') => {
        if (!attendanceTask) return;

        const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';

        console.log('Toggling attendance:', {
            taskId: attendanceTask.id,
            studentId,
            currentStatus,
            newStatus
        });

        try {
            const updated = await TaskStatusRepository.updateTaskStatusByTaskAndStudent(
                attendanceTask.id,
                studentId,
                newStatus
            );

            console.log('✅ Attendance updated in Supabase:', updated);

            setStudentAttendances(prev =>
                prev.map(sa =>
                    sa.student.id === studentId ? { ...sa, status: newStatus } : sa
                )
            );
        } catch (error) {
            console.error('❌ Error updating attendance:', error);
            alert('Failed to update attendance');
        }
    };


    const handleLanguageTabSwitch = async (language: 'GERMAN' | 'FRENCH') => {
        setSelectedLanguage(language);
        if (attendanceTask) {
            await loadStudentStatuses(attendanceTask.id, language);
        }
    };
    const handleExport = async () => {
        if (!user || !selectedDate) return;
        try {
            await ExportService.generateWeeklyAttendanceExport(
                user.classId,
                selectedWeek,
                selectedDate.getMonth(),
                selectedDate.getFullYear()
            );
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export attendance');
        }
    };

    const getWeekNumber = (date: Date) => {
        const day = date.getDate();
        if (day <= 7) return 1;
        if (day <= 14) return 2;
        if (day <= 21) return 3;
        return 4;
    };

    const getWeekColor = (date: Date) => {
        const week = getWeekNumber(date);
        switch (week) {
            case 1: return 'bg-blue-50 border-blue-200';
            case 2: return 'bg-purple-50 border-purple-200';
            case 3: return 'bg-pink-50 border-pink-200';
            case 4: return 'bg-orange-50 border-orange-200';
            default: return '';
        }
    };

    const presentCount = studentAttendances.filter(sa => sa.status === 'PRESENT').length;
    const absentCount = studentAttendances.filter(sa => sa.status === 'ABSENT').length;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="w-8 h-8 text-primary-600" />
                            <h1 className="text-3xl font-bold text-slate-900">Attendance Calendar</h1>
                        </div>
                        <p className="text-slate-600">Select a date and period to mark attendance</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">Export:</span>
                            <select
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                                className="border rounded-md text-sm p-1.5"
                            >
                                <option value={1}>Week 1</option>
                                <option value={2}>Week 2</option>
                                <option value={3}>Week 3</option>
                                <option value={4}>Week 4</option>
                            </select>
                        </div>
                        <Button
                            onClick={handleExport}
                            variant="secondary"
                            className="flex items-center gap-2 text-sm py-1.5"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Calendar */}
                    <div>
                        <Calendar
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            markedDates={markedDates}
                            getDateClassName={(date) => {
                                const base = getWeekColor(date);
                                return `${base} border`;
                            }}
                        />

                        {/* Week Color Legend */}
                        <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Week Color Legend</h3>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                                    <span>Week 1 (Days 1-7)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded"></div>
                                    <span>Week 2 (Days 8-14)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-pink-50 border border-pink-200 rounded"></div>
                                    <span>Week 3 (Days 15-21)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
                                    <span>Week 4 (Days 22+)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Timetable or Attendance List */}
                    <div>
                        <Card>
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                                    {selectedDate
                                        ? selectedDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                        : 'Select a date'}
                                </h2>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : selectedPeriod ? (
                                // Attendance Marking View
                                <div>
                                    <button
                                        onClick={() => setSelectedPeriod(null)}
                                        className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Back to Timetable
                                    </button>

                                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                        <h3 className="font-bold text-lg text-blue-900">{selectedPeriod.subject}</h3>
                                        <div className="text-sm text-blue-700 flex items-center gap-2 mt-1">
                                            <Clock className="w-4 h-4" />
                                            {PERIOD_TIMES[selectedPeriod.periodIndex]}
                                        </div>
                                    </div>

                                    {attendanceTask && (
                                        <div className="flex gap-4 text-sm mb-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-slate-600">
                                                    Present: <strong className="text-green-600">{presentCount}</strong>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-slate-600">
                                                    Absent: <strong className="text-red-600">{absentCount}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {!attendanceTask ? (
                                        <div className="text-center py-8">
                                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-slate-500 mb-4">Creating attendance record...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* DEBUG PANEL — REMOVE AFTER FIXING ELECTIVE TABS */}
                                            <div style={{ padding: '10px', marginBottom: '12px', border: '2px dashed #888', background: '#fff' }}>
                                                <strong>DEBUG — Elective Runtime State</strong>
                                                <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto', marginTop: '8px' }}>
                                                    {JSON.stringify(
                                                        {
                                                            subjectId: selectedPeriod?.subjectId ?? null,
                                                            subjectName: selectedPeriod?.subject ?? null,
                                                            subjectOptions: electiveOptions ?? null,
                                                            isElective: currentSubject?.type === 'PREFERRED_GROUP',
                                                            hasLoaderFunction: typeof loadStudentStatuses === 'function'
                                                        },
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </div>

                                            {/* Phase 5: Dynamic Elective Tab Switcher */}
                                            {currentSubject?.type === 'PREFERRED_GROUP' && electiveOptions.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {electiveOptions.map(option => (
                                                            <button
                                                                key={option.id}
                                                                onClick={async () => {
                                                                    console.log('Selected option:', option.id);
                                                                    setSelectedOption(option.id);
                                                                    if (attendanceTask) {
                                                                        await loadStudentStatuses(attendanceTask.id);
                                                                    }
                                                                }}
                                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedOption === option.id
                                                                    ? 'bg-blue-600 text-white shadow-md'
                                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    }`}
                                                                aria-pressed={selectedOption === option.id}
                                                                type="button"
                                                            >
                                                                {option.name}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={async () => {
                                                                console.log('Selected option: UNASSIGNED');
                                                                setSelectedOption('UNASSIGNED');
                                                                if (attendanceTask) {
                                                                    await loadStudentStatuses(attendanceTask.id);
                                                                }
                                                            }}
                                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedOption === 'UNASSIGNED'
                                                                ? 'bg-orange-600 text-white shadow-md'
                                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                }`}
                                                            aria-pressed={selectedOption === 'UNASSIGNED'}
                                                            type="button"
                                                        >
                                                            Unassigned
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        Showing students for: <strong>{selectedOption === 'UNASSIGNED' ? 'Unassigned' : electiveOptions.find(o => o.id === selectedOption)?.name}</strong>
                                                    </p>
                                                </div>
                                            )}

                                            {/* Legacy: Language Tab Switcher for old German/French periods */}
                                            {selectedPeriod && isLanguagePeriod(selectedPeriod.subject) && (
                                                <div className="mb-4">
                                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                                                        <button
                                                            onClick={() => handleLanguageTabSwitch('GERMAN')}
                                                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${selectedLanguage === 'GERMAN'
                                                                ? 'bg-white text-primary-600 shadow-sm'
                                                                : 'text-slate-600 hover:text-slate-900'
                                                                }`}
                                                        >
                                                            German
                                                        </button>
                                                        <button
                                                            onClick={() => handleLanguageTabSwitch('FRENCH')}
                                                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${selectedLanguage === 'FRENCH'
                                                                ? 'bg-white text-primary-600 shadow-sm'
                                                                : 'text-slate-600 hover:text-slate-900'
                                                                }`}
                                                        >
                                                            French
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Warning for language periods with students without language preference */}
                                            {selectedPeriod && isLanguagePeriod(selectedPeriod.subject) && (() => {
                                                const unassignedCount = countStudentsWithoutLanguage(allClassStudents);
                                                return unassignedCount > 0 ? (
                                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                        <div className="text-sm text-amber-800">
                                                            <strong>{unassignedCount}</strong> student{unassignedCount !== 1 ? 's have' : ' has'} no assigned language preference and won't appear in this list.
                                                        </div>
                                                    </div>
                                                ) : null;
                                            })()}

                                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                                {studentAttendances.map(({ student, status }) => (
                                                    <div
                                                        key={student.id}
                                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono text-sm text-slate-600 w-20">
                                                                {student.rollNo}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-slate-900">{student.name}</span>
                                                                {student.role === 'CR' && (
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded border border-blue-200">
                                                                        CR
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleToggleAttendance(student.id, status)}
                                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${status === 'PRESENT'
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                }`}
                                                        >
                                                            {status === 'PRESENT' ? 'Present' : 'Absent'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                // Timetable View
                                <div className="space-y-3">
                                    {dayTimetable.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            No classes scheduled for this day.
                                        </div>
                                    ) : (
                                        dayTimetable.map((entry) => (
                                            <div
                                                key={entry.periodIndex}
                                                onClick={() => setSelectedPeriod(entry)}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                                            >
                                                <div>
                                                    <div className="font-medium text-slate-900">{entry.subject}</div>
                                                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        {PERIOD_TIMES[entry.periodIndex]}
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                            {entry.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    {periodStatuses[entry.periodIndex] ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Done
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm group-hover:text-primary-600">
                                                            Take Attendance →
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div >
        </Layout >
    );
};
