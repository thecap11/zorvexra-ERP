import React from 'react';
import { X, Bell, Clock } from 'lucide-react';
import { Notification } from '../types';
import { Button } from './Button';

interface NotificationPopupProps {
    notifications: Notification[];
    onMarkAsRead: (notificationId: string) => void;
    onMarkAllAsRead: () => void;
    onClose: () => void;
}

// Helper function to format relative time
const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose,
}) => {
    if (notifications.length === 0) return null;

    const handleMarkAllAndClose = () => {
        onMarkAllAsRead();
        onClose();
    };

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
                            <h3 className="text-lg font-semibold text-slate-900">New Notifications</h3>
                            <p className="text-sm text-slate-600">
                                You have {notifications.length} unread notification
                                {notifications.length > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Notifications List */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)] space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-slate-900 text-lg">
                                    {notification.title}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{getRelativeTime(new Date(notification.createdAt))}</span>
                                </div>
                            </div>
                            <p className="text-slate-700 whitespace-pre-line mb-3">
                                {notification.message}
                            </p>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-slate-500">
                                    Sent on {new Date(notification.createdAt).toLocaleString()}
                                </p>
                                <Button
                                    onClick={() => onMarkAsRead(notification.id)}
                                    variant="secondary"
                                    className="text-sm py-1 px-3"
                                >
                                    Mark as Read
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <button
                        onClick={handleMarkAllAndClose}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                    >
                        Mark all as read & close
                    </button>
                    <Button onClick={onClose} variant="secondary">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};
