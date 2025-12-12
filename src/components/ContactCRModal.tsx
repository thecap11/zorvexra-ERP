import React, { useState } from 'react';
import { X, Send, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CRMessageRepository } from '../services/crMessageRepository';
import { supabase } from '../lib/supabaseClient';
import { Button } from './Button';

interface ContactCRModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const ContactCRModal: React.FC<ContactCRModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!subject.trim()) {
            setError('Subject is required');
            return;
        }
        if (!message.trim()) {
            setError('Message is required');
            return;
        }

        if (!user) return;

        setIsLoading(true);

        try {
            // Get the CR for this class by querying Supabase directly
            const { data: crData, error: crError } = await supabase
                .from('users')
                .select('*')
                .eq('class_id', user.classId)
                .eq('role', 'CR')
                .limit(1)
                .single();

            console.log('CR lookup result:', { crData, crError, studentClassId: user.classId });

            if (crError || !crData) {
                setError('No Class Representative found for your class');
                setIsLoading(false);
                return;
            }

            // Create the message
            const messageData = {
                classId: user.classId,
                fromStudentId: user.id,
                toCrId: crData.id,
                subject: subject.trim(),
                message: message.trim(),
            };
            console.log('Creating message with data:', messageData);
            const result = await CRMessageRepository.createMessage(messageData);

            if (result) {
                // Reset form
                setSubject('');
                setMessage('');
                onSuccess();
                onClose();
            } else {
                setError('Failed to send message');
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
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            Contact Class Representative
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-sm text-blue-700">
                            💡 Use this to ask doubts, request clarifications, or raise any issues
                            with your Class Representative.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g., Assignment Doubt, Timetable Query"
                            maxLength={100}
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Message / Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Describe your query or request in detail..."
                            maxLength={1000}
                        />
                        <p className="text-xs text-slate-500 text-right">
                            {message.length}/1000 characters
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            <Send className="w-4 h-4 mr-2" />
                            {isLoading ? 'Sending...' : 'Send Message'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
