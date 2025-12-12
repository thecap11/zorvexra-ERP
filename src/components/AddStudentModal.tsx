import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { UserRepository } from '../services/userRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classId: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    classId,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rollNo: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

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
            if (!formData.name || !formData.email || !formData.password || !formData.rollNo) {
                throw new Error('All fields are required');
            }

            // Create student
            const newStudent = await UserRepository.createStudent({
                name: formData.name,
                email: formData.email,
                password: formData.password, // In production, hash this
                role: 'STUDENT',
                rollNo: formData.rollNo,
                classId: classId,
            });

            // Initialize task statuses for the new student
            await TaskStatusRepository.initializeStatusesForNewStudent(newStudent.id, classId);

            // Reset form and close
            setFormData({ name: '', email: '', password: '', rollNo: '' });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', email: '', password: '', rollNo: '' });
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-slide-in">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold text-slate-900">Add New Student</h3>
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
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
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
                            {loading ? 'Adding...' : 'Add Student'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
