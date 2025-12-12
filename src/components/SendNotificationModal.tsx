import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationRepository } from '../services/notificationRepository';
import { UserRepository } from '../services/userRepository';
import { User } from '../types';
import { Button } from './Button';

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sendTo, setSendTo] = useState<'all' | 'specific'>('all');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchStudents();
        }
    }, [isOpen, user]);

    const fetchStudents = async () => {
        if (!user) return;
        const studentList = await UserRepository.getStudentsByClassId(user.classId);
        setStudents(studentList);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        if (!message.trim()) {
            setError('Message is required');
            return;
        }
        if (sendTo === 'specific' && !selectedStudentId) {
            setError('Please select a student');
            return;
        }

        if (!user) return;

        setIsLoading(true);

        try {
            const result = await NotificationRepository.createNotification({
                classId: user.classId,
                recipientId: sendTo === 'all' ? null : selectedStudentId,
                title: title.trim(),
                message: message.trim(),
                createdBy: user.id,
            });

            if (result) {
                // Reset form
                setTitle('');
                setMessage('');
                setSendTo('all');
                setSelectedStudentId('');
                onSuccess();
                onClose();
            } else {
                setError('Failed to send notification');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Send Notification</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g., Class Cancelled, Assignment Reminder"
                            maxLength={100}
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Enter your notification message..."
                            maxLength={500}
                        />
                        <p className="text-xs text-slate-500 text-right">
                            {message.length}/500 characters
                        </p>
                    </div>

                    {/* Send To */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Send To</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name="sendTo"
                                    value="all"
                                    checked={sendTo === 'all'}
                                    onChange={() => {
                                        setSendTo('all');
                                        setSelectedStudentId('');
                                    }}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">
                                    <span className="font-medium">Whole Class</span> - Send to all
                                    students
                                </span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name="sendTo"
                                    value="specific"
                                    checked={sendTo === 'specific'}
                                    onChange={() => setSendTo('specific')}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">
                                    <span className="font-medium">Specific Student</span> - Send to
                                    one student
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Student Dropdown */}
                    {sendTo === 'specific' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-sm font-medium text-slate-700">
                                Select Student <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            >
                                <option value="">-- Choose a student --</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} {student.rollNo ? `(${student.rollNo})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            <Send className="w-4 h-4 mr-2" />
                            {isLoading ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
