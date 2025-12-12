import React, { useState } from 'react';
import { Button } from './Button';
import { X, AlertCircle } from 'lucide-react';

interface IssueSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (remarks: string) => void;
    taskTitle: string;
}

export const IssueSubmissionModal: React.FC<IssueSubmissionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    taskTitle,
}) => {
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!remarks.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(remarks);
            setRemarks('');
            onClose();
        } catch (error) {
            console.error('Error submitting issue:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRemarks('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Report an Issue
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    {taskTitle}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Describe your issue *
                            </label>
                            <textarea
                                className="input-field min-h-[120px] resize-none"
                                placeholder="Please explain why you couldn't complete this task..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value.slice(0, 500))}
                                required
                                autoFocus
                            />
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-slate-500">
                                    Be specific about the issue you encountered
                                </p>
                                <p className="text-xs text-slate-500">
                                    {remarks.length}/500
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                            <Button
                                type="submit"
                                disabled={!remarks.trim() || isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Issue'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
