import React, { useState } from 'react';
import { X, Eye, EyeOff, Key } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: User | null;
    onSuccess: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
    isOpen,
    onClose,
    student,
    onSuccess,
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !student) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!newPassword.trim()) {
            setError('Password cannot be empty');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            const { UserRepository } = await import('../services/userRepository');
            await UserRepository.updateUser(student.id, { password: newPassword });

            // Success!
            onClose();
            setNewPassword('');
            setConfirmPassword('');

            // Show success message
            alert(`Password updated successfully for ${student.name}`);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Key className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">Reset Password</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Student Info */}
                <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200">
                    <div className="space-y-1">
                        <p className="text-sm text-slate-500">Resetting password for:</p>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-600">{student.email}</p>
                        <p className="text-xs text-slate-500">Roll No: {student.rollNo}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter new password"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Confirm new password"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Helper Text */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                            💡 <strong>Share this new password with the student</strong> so they can log in.
                            Password must be at least 6 characters long.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
