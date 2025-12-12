import React, { useState } from 'react';
import { X, AlertCircle, Key } from 'lucide-react';
import { UserRepository } from '../services/userRepository';
import { Button } from './Button';

interface ChangeCRPasswordModalProps {
    isOpen: boolean;
    crId: string | null;
    crName: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export const ChangeCRPasswordModal: React.FC<ChangeCRPasswordModalProps> = ({
    isOpen,
    crId,
    crName,
    onClose,
    onSuccess,
}) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newPassword.trim()) {
            setError('Password is required');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!crId) return;

        setIsLoading(true);

        try {
            const success = await UserRepository.changeUserPassword(crId, newPassword.trim());

            if (success) {
                setNewPassword('');
                setConfirmPassword('');
                onSuccess();
                onClose();
            } else {
                setError('Failed to change password');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        onClose();
    };

    if (!isOpen || !crId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
                            <p className="text-sm text-slate-600">{crName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Enter new password"
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Confirm new password"
                            minLength={6}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
