import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useStudentTaskStatuses } from '../hooks/useTaskStatuses';
import { TaskRepository } from '../services/taskRepository';
import { NotificationRepository } from '../services/notificationRepository';
import { Task, Notification } from '../types';
import { CheckCircle2, XCircle, Calendar, ClipboardList, AlertCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationPopup } from '../components/NotificationPopup';
import { ContactCRModal } from '../components/ContactCRModal';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { statuses, isLoading } = useStudentTaskStatuses(user?.id || '');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showContactCR, setShowContactCR] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            const allTasks = await TaskRepository.getAllTasks();
            setTasks(allTasks);
        };
        fetchTasks();
    }, []);

    // Fetch unread notifications for student
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user?.id || !user?.classId) return;
            const unread = await NotificationRepository.getUnreadNotificationsForStudent(
                user.id,
                user.classId
            );
            if (unread.length > 0) {
                setNotifications(unread);
                setShowNotifications(true);
            }
        };
        fetchNotifications();
    }, [user?.id, user?.classId]);

    // Notification handlers
    const handleMarkAsRead = async (notificationId: string) => {
        await NotificationRepository.markNotificationAsRead(notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notifications.length <= 1) {
            setShowNotifications(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.id || !user?.classId) return;
        await NotificationRepository.markAllNotificationsAsRead(user.id, user.classId);
        setNotifications([]);
        setShowNotifications(false);
    };

    // Calculate stats
    const assignmentStatuses = statuses.filter(s => {
        const task = tasks.find(t => t.id === s.taskId);
        return task?.type === 'ASSIGNMENT';
    });

    const attendanceStatuses = statuses.filter(s => {
        const task = tasks.find(t => t.id === s.taskId);
        return task?.type === 'ATTENDANCE';
    });

    const completedAssignments = assignmentStatuses.filter(s => s.status === 'COMPLETED').length;
    const totalAssignments = assignmentStatuses.length;

    const presentCount = attendanceStatuses.filter(s => s.status === 'PRESENT').length;
    const totalAttendance = attendanceStatuses.length;
    const attendancePercentage = totalAttendance > 0
        ? Math.round((presentCount / totalAttendance) * 100)
        : 0;

    // Get upcoming assignments
    const upcomingAssignments = tasks
        .filter(t => t.type === 'ASSIGNMENT')
        .map(task => {
            const status = statuses.find(s => s.taskId === task.id);
            return { task, status };
        })
        .filter(({ status }) => status?.status !== 'COMPLETED')
        .sort((a, b) => {
            if (!a.task.dueDate) return 1;
            if (!b.task.dueDate) return -1;
            return new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime();
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
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm">
                    <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
                    <div className="flex flex-wrap items-center gap-4 text-blue-100">
                        <p>Roll No: {user?.rollNo}</p>
                        <span className="text-blue-300">•</span>
                        <p className="flex items-center gap-1.5">
                            Language: {user?.preferredLanguage ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/30 text-white border border-blue-400/50">
                                    {user.preferredLanguage === 'GERMAN' ? '🇩🇪 German' : '🇫🇷 French'}
                                </span>
                            ) : (
                                <span className="text-blue-200/70 italic">Not assigned</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Attendance</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{attendancePercentage}%</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {presentCount} / {totalAttendance} classes
                                </p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Calendar className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 font-medium">Assignments</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {completedAssignments} / {totalAssignments}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">Completed</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <ClipboardList className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Upcoming Assignments */}
                <Card title="Active Tasks" subtitle="Assignments that need your attention">
                    {isLoading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : upcomingAssignments.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">All caught up!</p>
                            <p className="text-sm text-gray-500">No pending assignments</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingAssignments.slice(0, 5).map(({ task, status }) => (
                                <div
                                    key={task.id}
                                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-l-4 border-transparent hover:border-primary-500"
                                    onClick={() => navigate(`/student/tasks/${task.id}`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                {status?.status === 'OTHER' && (
                                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span>Issue</span>
                                                    </span>
                                                )}
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {task.description.length > 100
                                                        ? `${task.description.substring(0, 100)}...`
                                                        : task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                {task.startDate && (
                                                    <span className="flex items-center space-x-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>
                                                    </span>
                                                )}
                                                {task.dueDate && (
                                                    <span className={`flex items-center space-x-1 ${isNearDeadline(task.dueDate) ? 'text-orange-600 font-medium' : ''
                                                        }`}>
                                                        <Calendar className="w-3 h-3" />
                                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            {status?.status === 'COMPLETED' ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            ) : status?.status === 'OTHER' ? (
                                                <AlertCircle className="w-6 h-6 text-orange-500" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {upcomingAssignments.length > 5 && (
                                <p className="text-sm text-gray-500 text-center pt-2">
                                    +{upcomingAssignments.length - 5} more tasks
                                </p>
                            )}
                        </div>
                    )}
                </Card>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={() => navigate('/student/assignments')}
                        className="py-4"
                    >
                        View All Assignments
                    </Button>
                    <Button
                        onClick={() => navigate('/student/attendance')}
                        variant="secondary"
                        className="py-4"
                    >
                        View Attendance History
                    </Button>
                    <Button
                        onClick={() => navigate('/student/timetable')}
                        variant="secondary"
                        className="py-4"
                    >
                        View Timetable
                    </Button>
                    <Button
                        onClick={() => setShowContactCR(true)}
                        variant="secondary"
                        className="py-4 flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Contact CR
                    </Button>
                </div>
            </div>

            {/* Notification Popup */}
            {showNotifications && (
                <NotificationPopup
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onClose={() => setShowNotifications(false)}
                />
            )}

            {/* Contact CR Modal */}
            {showContactCR && (
                <ContactCRModal
                    isOpen={showContactCR}
                    onClose={() => setShowContactCR(false)}
                    onSuccess={() => {
                        // Show success message console.log('Message sent to CR successfully!');
                    }}
                />
            )}
        </Layout>
    );
};
