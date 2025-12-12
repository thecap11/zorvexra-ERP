import React, { useState, useEffect } from 'react';
import { X, Bell, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationRepository } from '../services/notificationRepository';
import { Notification } from '../types';
import { Button } from './Button';

interface NotificationsHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Helper function to format timestamp
const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

export const NotificationsHistoryModal: React.FC<NotificationsHistoryModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchNotifications();
        }
    }, [isOpen, user]);

    const fetchNotifications = async () => {
        if (!user?.id || !user?.classId) return;

        setIsLoading(true);
        try {
            const latest5 = await NotificationRepository.getLatest5AndDeleteOlder(
                user.id,
                user.classId
            );
            setNotifications(latest5);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Recent Notifications</h3>
                            <p className="text-sm text-slate-600">Your last 5 notifications</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Notifications List or Empty State */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-slate-500">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-slate-900 mb-2">No notifications yet</h4>
                            <p className="text-slate-500">You'll see your notifications here when you receive them.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="py-4 hover:bg-slate-50 px-4 -mx-4 rounded-lg transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Unread indicator */}
                                        {!notification.readAt && (
                                            <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                        )}
                                        {notification.readAt && (
                                            <div className="mt-2 w-2 h-2 flex-shrink-0"></div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h4 className="font-semibold text-slate-900">
                                                    {notification.title}
                                                </h4>
                                                <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="whitespace-nowrap">
                                                        {formatTimestamp(notification.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-slate-700 text-sm whitespace-pre-line">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <Button onClick={onClose} variant="secondary">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};
