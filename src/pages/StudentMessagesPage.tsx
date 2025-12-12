import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { CRMessageRepository } from '../services/crMessageRepository';
import { UserRepository } from '../services/userRepository';
import { CRMessage, User, CRMessageStatus } from '../types';
import { MessageSquare, Clock, User as UserIcon, Mail } from 'lucide-react';
import { MessageDetailModal } from '../components/MessageDetailModal';

export const StudentMessagesPage: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<CRMessage[]>([]);
    const [students, setStudents] = useState<Map<string, User>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<CRMessage | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user]);

    const fetchMessages = async () => {
        if (!user?.id) return;

        console.log('[StudentMessagesPage] Fetching messages for CR ID:', user.id, 'Class ID:', user.classId);
        setIsLoading(true);
        const msgs = await CRMessageRepository.getMessagesForCR(user.id);
        console.log('[StudentMessagesPage] Fetched messages count:', msgs.length, 'Messages:', msgs);
        setMessages(msgs);

        // Fetch student info for all messages
        const studentIds = [...new Set(msgs.map((m) => m.fromStudentId))];
        const studentMap = new Map<string, User>();

        await Promise.all(
            studentIds.map(async (studentId) => {
                const student = await UserRepository.getUserById(studentId);
                if (student) {
                    studentMap.set(studentId, student);
                }
            })
        );

        setStudents(studentMap);
        setIsLoading(false);
    };

    const handleMessageClick = (message: CRMessage) => {
        setSelectedMessage(message);
        setShowDetailModal(true);
    };

    const handleStatusUpdate = (messageId: string, newStatus: CRMessageStatus) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId
                    ? { ...msg, status: newStatus, updatedAt: new Date().toISOString() }
                    : msg
            )
        );
    };

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

    const unreadCount = messages.filter((m) => m.status === 'UNREAD').length;

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                            <MessageSquare className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Student Messages</h1>
                            <p className="text-blue-100 text-lg">
                                {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <Card>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 text-slate-500">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                            <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                                No messages yet
                            </h3>
                            <p className="text-slate-500">
                                Student messages will appear here when they contact you.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {messages.map((message) => {
                                const student = students.get(message.fromStudentId);
                                const isUnread = message.status === 'UNREAD';

                                return (
                                    <div
                                        key={message.id}
                                        onClick={() => handleMessageClick(message)}
                                        className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${isUnread ? 'bg-blue-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Unread indicator */}
                                            {isUnread && (
                                                <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                            )}
                                            {!isUnread && <div className="mt-2 w-2 h-2 flex-shrink-0"></div>}

                                            {/* Message content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                                            <span
                                                                className={`font-semibold ${isUnread
                                                                    ? 'text-slate-900'
                                                                    : 'text-slate-700'
                                                                    }`}
                                                            >
                                                                {student?.name || 'Unknown'}
                                                            </span>
                                                            {student?.rollNo && (
                                                                <span className="text-sm text-slate-500">
                                                                    ({student.rollNo})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4
                                                            className={`text-base mb-1 ${isUnread
                                                                ? 'font-semibold text-slate-900'
                                                                : 'font-medium text-slate-700'
                                                                }`}
                                                        >
                                                            {message.subject}
                                                        </h4>
                                                        <p className="text-sm text-slate-600 line-clamp-2">
                                                            {message.message}
                                                        </p>
                                                    </div>

                                                    {/* Status and time */}
                                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                                message.status
                                                            )}`}
                                                        >
                                                            {message.status}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Clock className="w-3 h-3" />
                                                            <span>
                                                                {new Date(
                                                                    message.createdAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <MessageDetailModal
                    message={selectedMessage}
                    isOpen={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedMessage(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </Layout>
    );
};
