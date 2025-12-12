import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useStudentTaskStatuses } from '../hooks/useTaskStatuses';
import { TaskRepository } from '../services/taskRepository';
import { Task } from '../types';
import { CheckCircle2, XCircle, Calendar } from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
    const { user } = useAuth();
    const { statuses, isLoading } = useStudentTaskStatuses(user?.id || '');
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const allTasks = await TaskRepository.getAllTasks();
            const attendanceTasks = allTasks.filter(t => t.type === 'ATTENDANCE');
            setTasks(attendanceTasks);
        };
        fetchTasks();
    }, []);

    const attendanceRecords = tasks.map(task => {
        const status = statuses.find(s => s.taskId === task.id);
        return { task, status };
    }).sort((a, b) => {
        return new Date(b.task.createdAt).getTime() - new Date(a.task.createdAt).getTime();
    });

    const presentCount = statuses.filter(s => s.status === 'PRESENT').length;
    const totalCount = statuses.length;
    const attendancePercentage = totalCount > 0
        ? Math.round((presentCount / totalCount) * 100)
        : 0;

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
                    <p className="text-slate-600 mt-1">Track your class attendance</p>
                </div>

                {/* Attendance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Attendance Rate</p>
                                <p className="text-4xl font-bold text-slate-900 mt-1">{attendancePercentage}%</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Calendar className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-primary-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Present</p>
                                <p className="text-4xl font-bold text-slate-900 mt-1">{presentCount}</p>
                            </div>
                            <div className="bg-primary-100 p-3 rounded-lg">
                                <CheckCircle2 className="w-8 h-8 text-primary-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Absent</p>
                                <p className="text-4xl font-bold text-slate-900 mt-1">{totalCount - presentCount}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-lg">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Attendance Records */}
                <Card title="Attendance History">
                    {isLoading ? (
                        <p className="text-slate-500">Loading attendance records...</p>
                    ) : attendanceRecords.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-slate-600">No attendance records yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Session</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {attendanceRecords.map(({ task, status }) => (
                                        <tr key={task.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-900">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-900">{task.title}</td>
                                            <td className="px-4 py-3">
                                                {status?.status === 'PRESENT' ? (
                                                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Present</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                        <XCircle className="w-4 h-4" />
                                                        <span>Absent</span>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};
