import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { useStudentTaskStatuses } from '../hooks/useTaskStatuses';
import { TaskRepository } from '../services/taskRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';
import { Task } from '../types';
import { CheckCircle2, Clock } from 'lucide-react';

export const StudentAssignmentsPage: React.FC = () => {
    const { user } = useAuth();
    const { statuses, isLoading, refetch } = useStudentTaskStatuses(user?.id || '');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

    useEffect(() => {
        const fetchTasks = async () => {
            const allTasks = await TaskRepository.getAllTasks();
            const assignments = allTasks.filter(t => t.type === 'ASSIGNMENT');
            setTasks(assignments);
        };
        fetchTasks();
    }, []);

    const handleToggleStatus = async (taskId: string, currentStatus: string) => {
        if (!user) return;

        const newStatus = currentStatus === 'COMPLETED' ? 'NOT_COMPLETED' : 'COMPLETED';

        try {
            await TaskStatusRepository.updateTaskStatusByTaskAndStudent(
                taskId,
                user.id,
                newStatus
            );
            refetch();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getTaskWithStatus = () => {
        return tasks.map(task => {
            const status = statuses.find(s => s.taskId === task.id);
            return { task, status };
        }).filter(({ status }) => {
            if (filter === 'completed') return status?.status === 'COMPLETED';
            if (filter === 'pending') return status?.status === 'NOT_COMPLETED';
            return true;
        }).sort((a, b) => {
            // Sort by due date
            if (!a.task.dueDate) return 1;
            if (!b.task.dueDate) return -1;
            return new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime();
        });
    };

    const tasksWithStatus = getTaskWithStatus();
    const completedCount = statuses.filter(s => s.status === 'COMPLETED').length;
    const totalCount = statuses.length;

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Assignments</h1>
                        <p className="text-slate-600 mt-1">
                            {completedCount} of {totalCount} completed
                        </p>
                    </div>
                </div>

                {/* Filter Buttons */}
                <Card>
                    <div className="flex space-x-3">
                        <Button
                            variant={filter === 'all' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All ({totalCount})
                        </Button>
                        <Button
                            variant={filter === 'pending' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter('pending')}
                        >
                            Pending ({totalCount - completedCount})
                        </Button>
                        <Button
                            variant={filter === 'completed' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter('completed')}
                        >
                            Completed ({completedCount})
                        </Button>
                    </div>
                </Card>

                {/* Assignments List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <Card>
                            <p className="text-slate-500">Loading assignments...</p>
                        </Card>
                    ) : tasksWithStatus.length === 0 ? (
                        <Card>
                            <div className="text-center py-8">
                                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">No assignments found</p>
                            </div>
                        </Card>
                    ) : (
                        tasksWithStatus.map(({ task, status }) => (
                            <Card key={task.id} className="hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                                            {status?.status === 'COMPLETED' ? (
                                                <Badge variant="success">
                                                    <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="warning">
                                                    <Clock className="w-3 h-3 mr-1 inline" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>

                                        {task.description && (
                                            <p className="text-slate-600 mt-2">{task.description}</p>
                                        )}

                                        <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                                            {task.dueDate && (
                                                <span className="flex items-center space-x-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                </span>
                                            )}
                                            {status?.submittedAt && (
                                                <span>
                                                    Submitted: {new Date(status.submittedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-4">
                                        <Button
                                            variant={status?.status === 'COMPLETED' ? 'secondary' : 'primary'}
                                            size="sm"
                                            onClick={() => handleToggleStatus(task.id, status?.status || 'NOT_COMPLETED')}
                                        >
                                            {status?.status === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Complete'}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
};
