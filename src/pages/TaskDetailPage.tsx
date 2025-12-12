import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TaskRepository } from '../services/taskRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';
import { UserRepository } from '../services/userRepository';
import { Task, TaskStatus, User } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const TaskDetailPage: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);
    const [statuses, setStatuses] = useState<TaskStatus[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'issues'>('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!taskId) return;

            try {
                const taskData = await TaskRepository.getTaskById(taskId);
                if (!taskData) {
                    navigate('/cr');
                    return;
                }

                const statusData = await TaskStatusRepository.getTaskStatusesByTask(taskId);
                const studentData = await UserRepository.getStudentsByClassId(taskData.classId);

                setTask(taskData);
                setStatuses(statusData);
                setStudents(studentData);
            } catch (error) {
                console.error('Error fetching task details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [taskId, navigate]);

    const handleStatusChange = async (studentId: string, newStatus: 'PRESENT' | 'ABSENT') => {
        if (!taskId) return;

        try {
            await TaskStatusRepository.updateTaskStatusByTaskAndStudent(
                taskId,
                studentId,
                newStatus
            );

            // Refresh statuses
            const updatedStatuses = await TaskStatusRepository.getTaskStatusesByTask(taskId);
            setStatuses(updatedStatuses);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleMarkAllPresent = async () => {
        if (!taskId) return;
        await TaskStatusRepository.bulkUpdateTaskStatuses(taskId, 'PRESENT');
        const updatedStatuses = await TaskStatusRepository.getTaskStatusesByTask(taskId);
        setStatuses(updatedStatuses);
    };

    const handleMarkAllAbsent = async () => {
        if (!taskId) return;
        await TaskStatusRepository.bulkUpdateTaskStatuses(taskId, 'ABSENT');
        const updatedStatuses = await TaskStatusRepository.getTaskStatusesByTask(taskId);
        setStatuses(updatedStatuses);
    };

    if (isLoading) {
        return (
            <Layout>
                <LoadingSpinner size="lg" className="min-h-[60vh]" />
            </Layout>
        );
    }

    if (!task) {
        return (
            <Layout>
                <Card>
                    <p className="text-slate-600">Task not found</p>
                </Card>
            </Layout>
        );
    }

    const getStudentStatus = (studentId: string) => {
        return statuses.find(s => s.studentId === studentId);
    };

    const filteredStudents = students.filter(student => {
        const status = getStudentStatus(student.id);
        if (filter === 'completed') return status?.status === 'COMPLETED';
        if (filter === 'pending') return status?.status === 'NOT_COMPLETED';
        if (filter === 'issues') return status?.status === 'OTHER';
        return true;
    });

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <Button
                    onClick={() => navigate('/cr')}
                    variant="secondary"
                    className="flex items-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </Button>

                {/* Task Info */}
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{task.title}</h1>
                            <p className="text-slate-600 mt-2">{task.description}</p>
                            <div className="flex items-center space-x-4 mt-4 text-sm text-slate-500">
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                                    {task.type === 'ASSIGNMENT' ? '📝 Assignment' : '📅 Attendance'}
                                </span>
                                {task.dueDate && (
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                )}
                                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Student Status List */}
                <Card title={task.type === 'ASSIGNMENT' ? 'Student Submissions' : 'Attendance Status'}>
                    {task.type === 'ASSIGNMENT' ? (
                        <div className="flex space-x-3 mb-6">
                            <Button
                                size="sm"
                                variant={filter === 'all' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('all')}
                            >
                                All ({students.length})
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'completed' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('completed')}
                            >
                                Completed ({statuses.filter(s => s.status === 'COMPLETED').length})
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'pending' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('pending')}
                            >
                                Pending ({statuses.filter(s => s.status === 'NOT_COMPLETED').length})
                            </Button>
                            <Button
                                size="sm"
                                variant={filter === 'issues' ? 'primary' : 'secondary'}
                                onClick={() => setFilter('issues')}
                            >
                                Issues ({statuses.filter(s => s.status === 'OTHER').length})
                            </Button>
                        </div>
                    ) : (
                        <div className="flex space-x-3 mb-6">
                            <Button size="sm" onClick={handleMarkAllPresent}>
                                Mark All Present
                            </Button>
                            <Button size="sm" variant="secondary" onClick={handleMarkAllAbsent}>
                                Mark All Absent
                            </Button>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Roll No</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                                    {task.type === 'ASSIGNMENT' && (
                                        <>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Submitted At</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Remarks</th>
                                        </>
                                    )}
                                    {task.type === 'ATTENDANCE' && (
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={task.type === 'ASSIGNMENT' ? 5 : 4} className="px-4 py-8 text-center text-slate-500">
                                            No students found for this filter
                                        </td>
                                    </tr>
                                )}
                                {filteredStudents.map(student => {
                                    const status = getStudentStatus(student.id);
                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-900">{student.rollNo}</td>
                                            <td className="px-4 py-3 text-sm text-slate-900">{student.name}</td>
                                            <td className="px-4 py-3">
                                                {task.type === 'ASSIGNMENT' ? (
                                                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${status?.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-700'
                                                        : status?.status === 'OTHER'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {status?.status === 'COMPLETED' ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span>Completed</span>
                                                            </>
                                                        ) : status?.status === 'OTHER' ? (
                                                            <>
                                                                <AlertCircle className="w-4 h-4" />
                                                                <span>Issue Submitted</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-4 h-4" />
                                                                <span>Not Completed</span>
                                                            </>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${status?.status === 'PRESENT'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {status?.status === 'PRESENT' ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span>Present</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-4 h-4" />
                                                                <span>Absent</span>
                                                            </>
                                                        )}
                                                    </span>
                                                )}
                                            </td>
                                            {task.type === 'ASSIGNMENT' && (
                                                <>
                                                    <td className="px-4 py-3 text-sm text-slate-600">
                                                        {status?.submittedAt
                                                            ? new Date(status.submittedAt).toLocaleString()
                                                            : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 max-w-xs">
                                                        {status?.remarks ? (
                                                            <div className="bg-orange-50 border border-orange-200 rounded p-2">
                                                                <p className="text-xs text-orange-800 whitespace-pre-wrap">{status.remarks}</p>
                                                            </div>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            {task.type === 'ATTENDANCE' && (
                                                <td className="px-4 py-3">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant={status?.status === 'PRESENT' ? 'success' : 'secondary'}
                                                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                        >
                                                            Present
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={status?.status === 'ABSENT' ? 'danger' : 'secondary'}
                                                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                        >
                                                            Absent
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};
