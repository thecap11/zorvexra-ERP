import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { TaskRepository } from '../services/taskRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';
import { Task, TaskStatus } from '../types';
import { Plus, ClipboardList, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CRTasksPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus[]>>({});
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.classId) return;

            try {
                const allTasks = await TaskRepository.getTasksByClassId(user.classId);
                const assignments = allTasks.filter(t => t.type === 'ASSIGNMENT');

                // Fetch statuses for each task
                const statusesMap: Record<string, TaskStatus[]> = {};
                for (const task of assignments) {
                    const statuses = await TaskStatusRepository.getTaskStatusesByTask(task.id);
                    statusesMap[task.id] = statuses;
                }

                setTasks(assignments);
                setTaskStatuses(statusesMap);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.classId]);

    const getTaskStats = (taskId: string) => {
        const statuses = taskStatuses[taskId] || [];
        const completed = statuses.filter(s => s.status === 'COMPLETED').length;
        const total = statuses.length;
        const pending = statuses.filter(s => s.status === 'NOT_COMPLETED').length;
        const issues = statuses.filter(s => s.status === 'OTHER').length;

        return { completed, total, pending, issues };
    };

    const filteredTasks = tasks.filter(task => {
        const stats = getTaskStats(task.id);
        if (filter === 'active') return stats.pending > 0 || stats.issues > 0;
        if (filter === 'completed') return stats.completed === stats.total && stats.total > 0;
        return true;
    }).sort((a, b) => {
        // Sort by creation date, newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const isNearDeadline = (dueDate?: string) => {
        if (!dueDate) return false;
        const deadline = new Date(dueDate);
        const today = new Date();
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 3;
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Assignment Tasks</h1>
                        <p className="text-slate-600 mt-1">Manage and track all assignments</p>
                    </div>
                    <Button
                        onClick={() => navigate('/cr/tasks/create')}
                        className="flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Task</span>
                    </Button>
                </div>

                {/* Filter Buttons */}
                <Card>
                    <div className="flex space-x-3">
                        <Button
                            variant={filter === 'all' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All Tasks ({tasks.length})
                        </Button>
                        <Button
                            variant={filter === 'active' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter('active')}
                        >
                            Active
                        </Button>
                        <Button
                            variant={filter === 'completed' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </Button>
                    </div>
                </Card>

                {/* Tasks List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <Card>
                            <p className="text-slate-500">Loading tasks...</p>
                        </Card>
                    ) : filteredTasks.length === 0 ? (
                        <Card>
                            <div className="text-center py-8">
                                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-slate-600 font-medium">No tasks found</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {filter === 'all'
                                        ? 'Create your first assignment task'
                                        : `No ${filter} tasks available`}
                                </p>
                                {filter === 'all' && (
                                    <Button
                                        onClick={() => navigate('/cr/tasks/create')}
                                        className="mt-4"
                                        size="sm"
                                    >
                                        Create Task
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ) : (
                        filteredTasks.map(task => {
                            const stats = getTaskStats(task.id);
                            const completionPercentage = stats.total > 0
                                ? Math.round((stats.completed / stats.total) * 100)
                                : 0;

                            return (
                                <div
                                    key={task.id}
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/cr/tasks/${task.id}`)}
                                >
                                    <Card className="hover:shadow-xl transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {task.title}
                                                    </h3>
                                                    {isNearDeadline(task.dueDate) && (
                                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                                            Due Soon
                                                        </span>
                                                    )}
                                                </div>

                                                {task.description && (
                                                    <p className="text-slate-600 text-sm mb-3">
                                                        {task.description.length > 150
                                                            ? `${task.description.substring(0, 150)}...`
                                                            : task.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                                    {task.startDate && (
                                                        <span className="flex items-center space-x-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>
                                                        </span>
                                                    )}
                                                    {task.dueDate && (
                                                        <span className="flex items-center space-x-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span className={isNearDeadline(task.dueDate) ? 'text-orange-600 font-medium' : ''}>
                                                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        </span>
                                                    )}
                                                    <span className="flex items-center space-x-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>{stats.total} students</span>
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-slate-600">Progress</span>
                                                        <span className="font-medium text-slate-900">{completionPercentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${completionPercentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-600">
                                                        <span className="flex items-center space-x-1">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            <span>{stats.completed} Completed</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                                            <span>{stats.pending} Pending</span>
                                                        </span>
                                                        {stats.issues > 0 && (
                                                            <span className="flex items-center space-x-1">
                                                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                                <span>{stats.issues} Issues</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Layout>
    );
};
