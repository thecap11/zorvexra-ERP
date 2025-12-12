import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRepository } from '../services/userRepository';
import { Button } from './Button';
import { Input } from './Input';

interface PersonalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PersonalDetailsModal: React.FC<PersonalDetailsModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setName(user.name);
            setEmail(user.email);
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsLoading(true);

        try {
            if (!name.trim()) throw new Error('Name is required');
            if (!email.trim() || !email.includes('@')) throw new Error('Valid email is required');

            // Check if email is unique if changed
            if (email !== user.email) {
                const isUnique = await UserRepository.isEmailUnique(email, user.id);
                if (!isUnique) throw new Error('Email is already in use');
            }

            const updatedUser = await UserRepository.updateUser(user.id, { name, email });

            if (updatedUser) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    window.location.reload(); // Simple way to refresh context
                }, 1500);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
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

                    {success && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Profile updated successfully! Reloading...
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="pt-2 flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || success}
                            className="flex-1"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
