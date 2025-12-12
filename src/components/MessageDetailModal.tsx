import React, { useState, useEffect } from 'react';
import { X, Clock, User as UserIcon } from 'lucide-react';
import { CRMessage, CRMessageStatus, User } from '../types';
import { CRMessageRepository } from '../services/crMessageRepository';
import { UserRepository } from '../services/userRepository';
import { Button } from './Button';

interface MessageDetailModalProps {
    message: CRMessage;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate: (messageId: string, status: CRMessageStatus) => void;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
    message,
    isOpen,
    onClose,
    onStatusUpdate,
}) => {
    const [student, setStudent] = useState<User | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (isOpen && message) {
            fetchStudent();
        }
    }, [isOpen, message]);

    const fetchStudent = async () => {
        const studentData = await UserRepository.getUserById(message.fromStudentId);
        if (studentData) {
            setStudent(studentData);
        }
    };

    const handleStatusChange = async (newStatus: CRMessageStatus) => {
        setIsUpdating(true);
        const success = await CRMessageRepository.updateStatus(message.id, newStatus);
        if (success) {
            onStatusUpdate(message.id, newStatus);
        }
        setIsUpdating(false);
    };

    if (!isOpen) return null;

    const getStatusColor = (status: CRMessageStatus) => {
        switch (status) {
            case 'UNREAD':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'READ':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'RESOLVED':
                return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Message Details</h3>
                        <p className="text-sm text-slate-600 mt-1">
                            From: {student?.name || 'Loading...'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Student Info */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-slate-700">Student Info:</span>
                        </div>
                        <div className="ml-6 space-y-1 text-sm text-slate-600">
                            <p>
                                <span className="font-medium">Name:</span> {student?.name || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Roll No:</span>{' '}
                                {student?.rollNo || 'N/A'}
                            </p>
                            <p>
                                <span className="font-medium">Email:</span> {student?.email || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Subject
                        </label>
                        <p className="text-lg font-semibold text-slate-900">{message.subject}</p>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Message
                        </label>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-slate-800 whitespace-pre-line">{message.message}</p>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                                Received: {new Date(message.createdAt).toLocaleString()}
                            </span>
                        </div>
                        {message.status !== 'UNREAD' && (
                            <div>
                                Updated: {new Date(message.updatedAt).toLocaleString()}
                            </div>
                        )}
                    </div>

                    {/* Current Status */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Current Status
                        </label>
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                message.status
                            )}`}
                        >
                            {message.status}
                        </span>
                    </div>

                    {/* Status Actions */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-3 block">
                            Update Status
                        </label>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleStatusChange('READ')}
                                variant="secondary"
                                disabled={isUpdating || message.status === 'READ'}
                                className="flex-1"
                            >
                                Mark as Read
                            </Button>
                            <Button
                                onClick={() => handleStatusChange('RESOLVED')}
                                disabled={isUpdating || message.status === 'RESOLVED'}
                                className="flex-1"
                            >
                                Mark as Resolved
                            </Button>
                        </div>
                    </div>
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
