import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { IssueSubmissionModal } from '../components/IssueSubmissionModal';
import { TaskRepository } from '../services/taskRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus } from '../types';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Calendar, Clock } from 'lucide-react';

export const StudentTaskDetailPage: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [task, setTask] = useState<Task | null>(null);
    const [status, setStatus] = useState<TaskStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!taskId || !user) return;

            try {
                const taskData = await TaskRepository.getTaskById(taskId);
                if (!taskData) {
                    navigate('/student');
                    return;
                }

                const statusData = await TaskStatusRepository.getTaskStatus(taskId, user.id);

                setTask(taskData);
                setStatus(statusData || null);
            } catch (error) {
                console.error('Error fetching task details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [taskId, user, navigate]);

    const handleStatusUpdate = async (newStatus: 'COMPLETED' | 'NOT_COMPLETED') => {
        if (!taskId || !user) return;

        setIsUpdating(true);
        try {
            await TaskStatusRepository.updateTaskStatusByTaskAndStudent(
                taskId,
                user.id,
                newStatus
            );

            // Refresh status
            const updatedStatus = await TaskStatusRepository.getTaskStatus(taskId, user.id);
            setStatus(updatedStatus || null);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleIssueSubmit = async (remarks: string) => {
        if (!taskId || !user) return;

        await TaskStatusRepository.updateTaskStatusWithRemarks(
            taskId,
            user.id,
            'OTHER',
            remarks
        );

        // Refresh status
        const updatedStatus = await TaskStatusRepository.getTaskStatus(taskId, user.id);
        setStatus(updatedStatus || null);
    };

    const isNearDeadline = (dueDate?: string) => {
        if (!dueDate) return false;
        const deadline = new Date(dueDate);
        const today = new Date();
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
    };

    const isPastDeadline = (dueDate?: string) => {
        if (!dueDate) return false;
        const deadline = new Date(dueDate);
        const today = new Date();
        return deadline < today;
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

    const getStatusBadge = () => {
        if (!status) return null;

        switch (status.status) {
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                    </span>
                );
            case 'OTHER':
                return (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        <span>Issue Submitted</span>
                    </span>
                );
            case 'NOT_COMPLETED':
            default:
                return (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Not Completed</span>
                    </span>
                );
        }
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <Button
                    onClick={() => navigate('/student')}
                    variant="secondary"
                    className="flex items-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </Button>

                {/* Task Info */}
                <Card>
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">{task.title}</h1>
                                {getStatusBadge()}
                            </div>
                        </div>

                        {task.description && (
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-slate-700 mb-2">Assignment Details</h3>
                                <p className="text-slate-900 whitespace-pre-wrap">{task.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {task.startDate && (
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-blue-600 font-medium">Start Date</p>
                                        <p className="text-sm text-slate-900">{new Date(task.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                            {task.dueDate && (
                                <div className={`flex items-center space-x-3 p-3 rounded-lg ${isPastDeadline(task.dueDate)
                                        ? 'bg-red-50'
                                        : isNearDeadline(task.dueDate)
                                            ? 'bg-orange-50'
                                            : 'bg-green-50'
                                    }`}>
                                    <Calendar className={`w-5 h-5 ${isPastDeadline(task.dueDate)
                                            ? 'text-red-600'
                                            : isNearDeadline(task.dueDate)
                                                ? 'text-orange-600'
                                                : 'text-green-600'
                                        }`} />
                                    <div>
                                        <p className={`text-xs font-medium ${isPastDeadline(task.dueDate)
                                                ? 'text-red-600'
                                                : isNearDeadline(task.dueDate)
                                                    ? 'text-orange-600'
                                                    : 'text-green-600'
                                            }`}>
                                            {isPastDeadline(task.dueDate) ? 'Deadline Passed' : 'Deadline'}
                                        </p>
                                        <p className="text-sm text-slate-900">{new Date(task.dueDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {status?.submittedAt && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-800">
                                    <strong>Submitted:</strong> {new Date(status.submittedAt).toLocaleString()}
                                </p>
                            </div>
                        )}

                        {status?.status === 'OTHER' && status.remarks && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-orange-800 mb-2">Your Issue Report</h3>
                                <p className="text-slate-900 whitespace-pre-wrap">{status.remarks}</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Action Buttons */}
                <Card title="Update Status">
                    <div className="space-y-4">
                        <p className="text-slate-600 text-sm">
                            Update your assignment status using the buttons below:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                disabled={isUpdating || status?.status === 'COMPLETED'}
                                className="flex items-center justify-center space-x-2 py-4"
                                variant={status?.status === 'COMPLETED' ? 'primary' : 'secondary'}
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Completed</span>
                            </Button>
                            <Button
                                onClick={() => handleStatusUpdate('NOT_COMPLETED')}
                                disabled={isUpdating || status?.status === 'NOT_COMPLETED'}
                                variant={status?.status === 'NOT_COMPLETED' ? 'primary' : 'secondary'}
                                className="flex items-center justify-center space-x-2 py-4"
                            >
                                <XCircle className="w-5 h-5" />
                                <span>Not Completed</span>
                            </Button>
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                disabled={isUpdating}
                                variant={status?.status === 'OTHER' ? 'primary' : 'secondary'}
                                className="flex items-center justify-center space-x-2 py-4"
                            >
                                <AlertCircle className="w-5 h-5" />
                                <span>Other (Issue)</span>
                            </Button>
                        </div>
                        {isUpdating && (
                            <p className="text-sm text-slate-500 text-center">Updating status...</p>
                        )}
                    </div>
                </Card>
            </div>

            <IssueSubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleIssueSubmit}
                taskTitle={task.title}
            />
        </Layout>
    );
};
