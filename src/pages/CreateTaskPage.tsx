import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { TaskRepository } from '../services/taskRepository';
import { TaskStatusRepository } from '../services/taskStatusRepository';
import { TaskType } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, CalendarCheck } from 'lucide-react';

export const CreateTaskPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'ASSIGNMENT' as TaskType,
        startDate: '',
        dueDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        try {
            // Create the task
            const newTask = await TaskRepository.createTask({
                classId: user.classId,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                startDate: formData.startDate || undefined,
                dueDate: formData.dueDate || undefined,
                createdBy: user.id,
            });

            // Initialize task statuses for all students
            await TaskStatusRepository.initializeTaskStatusesForTask(
                newTask.id,
                user.classId,
                formData.type
            );

            setShowSuccess(true);
            setTimeout(() => {
                navigate('/cr');
            }, 1500);
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="max-w-md w-full text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Task Created!</h2>
                        <p className="text-slate-600">Redirecting to dashboard...</p>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto animate-fade-in">
                <Button
                    onClick={() => navigate('/cr')}
                    variant="secondary"
                    className="mb-6 flex items-center space-x-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </Button>

                <Card title="Create New Task" subtitle="Add an assignment or attendance record">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Task Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'ASSIGNMENT' })}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-sm
                                        ${formData.type === 'ASSIGNMENT'
                                            ? 'bg-[#3A5AFE] border-[#3A5AFE] text-white shadow-md scale-[1.03]'
                                            : 'bg-white border-[#94A3B8] text-[#0F172A] hover:border-[#3A5AFE] hover:shadow-md hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:scale-[1.02]'
                                        }`}
                                >
                                    <FileText className={`w-6 h-6 ${formData.type === 'ASSIGNMENT' ? 'text-white' : 'text-[#3A5AFE]'}`} />
                                    <div className="text-center">
                                        <p className="font-medium">Assignment</p>
                                        <p className={`text-xs mt-1 ${formData.type === 'ASSIGNMENT' ? 'text-blue-100' : 'text-slate-500'}`}>
                                            Homework or project
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'ATTENDANCE' })}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-sm
                                        ${formData.type === 'ATTENDANCE'
                                            ? 'bg-[#3A5AFE] border-[#3A5AFE] text-white shadow-md scale-[1.03]'
                                            : 'bg-white border-[#94A3B8] text-[#0F172A] hover:border-[#3A5AFE] hover:shadow-md hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:scale-[1.02]'
                                        }`}
                                >
                                    <CalendarCheck className={`w-6 h-6 ${formData.type === 'ATTENDANCE' ? 'text-white' : 'text-[#3A5AFE]'}`} />
                                    <div className="text-center">
                                        <p className="font-medium">Attendance</p>
                                        <p className={`text-xs mt-1 ${formData.type === 'ATTENDANCE' ? 'text-blue-100' : 'text-slate-500'}`}>
                                            Mark presence
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <Input
                            label="Title"
                            placeholder="e.g., Data Structures Assignment"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description
                            </label>
                            <textarea
                                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A5AFE] focus:border-[#3A5AFE] transition-all min-h-[120px]"
                                placeholder="Add details about this task..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>


                        {formData.type === 'ASSIGNMENT' && (
                            <>
                                <Input
                                    type="date"
                                    label="Start Date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                                <Input
                                    type="date"
                                    label="Deadline / Due Date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    required
                                    min={formData.startDate || undefined}
                                />
                            </>
                        )}


                        <div className="flex space-x-4">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? 'Creating...' : 'Create Task'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/cr')}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </Layout>
    );
};
