import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { User } from '../types';
import { UserRepository } from '../services/userRepository';

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student: User | null;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    student,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rollNo: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                email: student.email,
                rollNo: student.rollNo || '',
            });
        }
    }, [student]);

    if (!isOpen || !student) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.email || !formData.rollNo) {
                throw new Error('All fields are required');
            }

            // Check email uniqueness (excluding current student)
            const emailUnique = await UserRepository.isEmailUnique(formData.email, student.id);
            if (!emailUnique) {
                throw new Error('Email already exists');
            }

            // Check roll number uniqueness (excluding current student)
            const rollNoUnique = await UserRepository.isRollNoUnique(
                student.classId,
                formData.rollNo,
                student.id
            );
            if (!rollNoUnique) {
                throw new Error('Roll number already exists in this class');
            }

            // Update student
            await UserRepository.updateUser(student.id, {
                name: formData.name,
                email: formData.email,
                rollNo: formData.rollNo,
            });

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update student');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-slide-in">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-slate-900">Edit Student</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Alice Johnson"
                        required
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g., alice@student.com"
                        required
                    />

                    <Input
                        label="Roll Number"
                        name="rollNo"
                        value={formData.rollNo}
                        onChange={handleChange}
                        placeholder="e.g., 21CS009"
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStudentModal;
